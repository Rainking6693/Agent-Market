"""
A2A Integration Tests - Ported from Genesis-Rebuild

Tests integration aspects of agent-to-agent transactions:
- Basic execution flows
- Wallet transfers
- Error handling
- Complex scenarios
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
async def test_basic_a2a_execution(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test basic A2A execution with wallet transfer"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="integration-test")

    budget = 25.0
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "integration test"}),
            "jobReference": f"integration-{new_uuid()}",
            "budget": budget,
        },
    )

    # Verify execution was successful
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    execution_record = execution["execution"]
    payment_transaction = execution["paymentTransaction"]
    
    assert execution_record["status"] == "SUCCESS"
    assert execution_record["initiatorType"] == "AGENT"
    assert payment_transaction["status"] == "SETTLED"
    assert float(payment_transaction["amount"]) == pytest.approx(budget)
@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_insufficient_funds(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution fails with insufficient funds"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    await wallet_linker(buyer_wallet["id"])

    # Try to execute with insufficient funds
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": "should fail"}),
                "jobReference": f"insufficient-funds-{new_uuid()}",
                "budget": 99.0,  # More than available
            },
        )

    response = error_info.value.response
    assert response.status_code == 400
    assert "insufficient" in response.text.lower()
@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_invalid_agent(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution fails with invalid agent ID"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    await wallet_linker(seller_wallet["id"])

    # Try to execute with invalid agent ID
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": "invalid-agent-id",
                "input": json.dumps({"task": "should fail"}),
                "jobReference": f"invalid-agent-{new_uuid()}",
                "budget": 10.0,
            },
        )

    response = error_info.value.response
    assert response.status_code in [400, 404]
@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_concurrent_a2a_executions(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test concurrent A2A executions"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent1 = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer1")
    buyer_agent2 = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer2")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet1 = await agentmarket_sdk.ensure_agent_wallet(buyer_agent1["id"])
    buyer_wallet2 = await agentmarket_sdk.ensure_agent_wallet(buyer_agent2["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet1["id"])
    await wallet_linker(buyer_wallet2["id"])

    # Fund both buyer wallets
    await agentmarket_sdk.fund_wallet(buyer_wallet1["id"], amount=50.0, reference="concurrent-test-1")
    await agentmarket_sdk.fund_wallet(buyer_wallet2["id"], amount=50.0, reference="concurrent-test-2")

    # Execute concurrently
    budget1 = 15.0
    budget2 = 20.0
    
    execution1_task = agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent1["id"],
            "input": json.dumps({"task": "concurrent test 1"}),
            "jobReference": f"concurrent-1-{new_uuid()}",
            "budget": budget1,
        },
    )
    
    execution2_task = agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent2["id"],
            "input": json.dumps({"task": "concurrent test 2"}),
            "jobReference": f"concurrent-2-{new_uuid()}",
            "budget": budget2,
        },
    )
    
    # Wait for both executions
    execution1 = await execution1_task
    execution2 = await execution2_task

    # Verify both executions were successful
    assert execution1 is not None
    assert execution2 is not None
    
    payment_transaction1 = execution1["paymentTransaction"]
    payment_transaction2 = execution2["paymentTransaction"]
    
    assert payment_transaction1["status"] == "SETTLED"
    assert payment_transaction2["status"] == "SETTLED"
    assert float(payment_transaction1["amount"]) == pytest.approx(budget1)
    assert float(payment_transaction2["amount"]) == pytest.approx(budget2)
@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_zero_budget(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with zero budget"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="zero-budget-test")

    budget = 0.0
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "zero budget test"}),
            "jobReference": f"zero-budget-{new_uuid()}",
            "budget": budget,
        },
    )

    # Verify execution was successful even with zero budget
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    payment_transaction = execution["paymentTransaction"]
    assert payment_transaction["status"] == "SETTLED"
    assert float(payment_transaction["amount"]) == pytest.approx(budget)
@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_metadata_tracking(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test that A2A execution metadata is properly tracked"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="metadata-test")

    job_reference = f"metadata-tracking-{new_uuid()}"
    budget = 12.5
    
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "metadata tracking test", "priority": "high"}),
            "jobReference": job_reference,
            "budget": budget,
        },
    )

    # Verify metadata is tracked
    assert execution is not None
    assert "execution" in execution
    
    execution_record = execution["execution"]
    assert execution_record["jobReference"] == job_reference
    assert execution_record["initiatorId"] == reviewer_user["id"]
    assert execution_record["initiatorAgentId"] == buyer_agent["id"]
    assert execution_record["agentId"] == seller_agent["id"]
    
    # Verify payment transaction metadata
    payment_transaction = execution["paymentTransaction"]
    assert payment_transaction["sourceWalletId"] == buyer_wallet["id"]
    assert payment_transaction["destinationWalletId"] == seller_wallet["id"]
    assert float(payment_transaction["amount"]) == pytest.approx(budget)
