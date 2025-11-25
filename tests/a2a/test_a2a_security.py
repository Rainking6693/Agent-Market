"""
A2A Security Tests - Ported from Genesis-Rebuild

Tests security aspects of agent-to-agent transactions:
- Authorization checks
- Budget enforcement
- Wallet security
- Initiator validation
- Payment verification
"""

from __future__ import annotations

import json
from typing import Awaitable, Callable, Dict

import httpx
import pytest

from agentmarket_testkit.retry import retry_with_exponential_backoff
from agentmarket_testkit.sdk import AgentMarketSDK
from agentmarket_testkit.utils import new_uuid


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_unauthorized_agent_cannot_initiate_transaction(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test that an unauthorized agent cannot initiate A2A transactions"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")

    # Try to execute with unauthorized initiator
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": "unauthorized-user-id",
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": "unauthorized attempt"}),
                "jobReference": f"unauthorized-{new_uuid()}",
                "budget": 10.0,
            },
        )

    response = error_info.value.response
    assert response.status_code in [401, 403]
    assert "unauthorized" in response.text.lower() or "forbidden" in response.text.lower()


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_budget_enforcement_prevents_over_spending(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test that budget limits are enforced"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")

    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund wallet with limited amount
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="budget-test")

    # Try to spend more than available
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": "over-budget attempt"}),
                "jobReference": f"over-budget-{new_uuid()}",
                "budget": 100.0,  # More than available
            },
        )

    response = error_info.value.response
    assert response.status_code == 400
    assert "insufficient" in response.text.lower() or "budget" in response.text.lower()


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_wallet_isolation_between_agents(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test that agents cannot access each other's wallets"""
    agent1 = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Agent1")
    agent2 = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Agent2")

    wallet1 = await agentmarket_sdk.ensure_agent_wallet(agent1["id"])
    wallet2 = await agentmarket_sdk.ensure_agent_wallet(agent2["id"])

    await wallet_linker(wallet1["id"])
    await wallet_linker(wallet2["id"])

    # Fund wallet1
    await agentmarket_sdk.fund_wallet(wallet1["id"], amount=100.0, reference="isolation-test")

    # Try to use agent1's wallet for agent2's transaction (should fail)
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            agent1["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": agent2["id"],
                "input": json.dumps({"task": "wallet isolation test"}),
                "jobReference": f"isolation-{new_uuid()}",
                "budget": 10.0,
                "sourceWalletId": wallet1["id"],  # Wrong wallet for agent2
            },
        )

    response = error_info.value.response
    # Should reject unauthorized wallet usage
    assert response.status_code in [400, 403]


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_payment_transaction_verification(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test that payment transactions are properly verified and recorded"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")

    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="verification-test")

    budget = 25.0
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "verification test"}),
            "jobReference": f"verify-{new_uuid()}",
            "budget": budget,
        },
    )

    payment_transaction = execution["paymentTransaction"]

    # Verify transaction details
    assert payment_transaction is not None
    assert payment_transaction["status"] == "SETTLED"
    assert float(payment_transaction["amount"]) == pytest.approx(budget)
    assert payment_transaction.get("sourceWalletId") == buyer_wallet["id"]
    assert payment_transaction.get("destinationWalletId") == seller_wallet["id"]

