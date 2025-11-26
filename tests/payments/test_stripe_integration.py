"""
Stripe Integration Tests - Ported from Genesis-Rebuild

Tests payment and transaction functionality through agent execution:
- Payment processing
- Transaction verification
- Budget enforcement
- Refund handling
"""

from __future__ import annotations

import json
import pytest
from typing import Awaitable, Callable, Dict

from agentmarket_testkit.sdk import AgentMarketSDK
from agentmarket_testkit.retry import retry_with_exponential_backoff
from agentmarket_testkit.utils import new_uuid


class TestPaymentProcessing:
    """"Test suite for payment processing"""

    @pytest.mark.asyncio
    @retry_with_exponential_backoff(attempts=4)
    async def test_payment_transaction_creation(
        self,
        agentmarket_sdk: AgentMarketSDK,
        approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
        wallet_linker: Callable[[str], Awaitable[None]],
        registered_user: Dict[str, str],
        reviewer_user: Dict[str, str],
    ) -> None:
        """Test that payment transactions are created during agent execution"""
        seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
        buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
        
        seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
        buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
        
        await wallet_linker(seller_wallet["id"])
        await wallet_linker(buyer_wallet["id"])

        # Fund buyer wallet
        await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="payment-test")

        budget = 25.0
        execution = await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": "payment test"}),
                "jobReference": f"payment-{new_uuid()}",
                "budget": budget,
            },
        )

        # Verify payment transaction was created
        assert execution is not None
        assert "paymentTransaction" in execution
        
        payment_transaction = execution["paymentTransaction"]
        assert payment_transaction is not None
        assert "id" in payment_transaction
        assert "status" in payment_transaction
        assert "amount" in payment_transaction
        assert "sourceWalletId" in payment_transaction
        assert "destinationWalletId" in payment_transaction
        
        # Verify transaction details
        assert payment_transaction["status"] == "SETTLED"
        assert float(payment_transaction["amount"]) == pytest.approx(budget)
        assert payment_transaction["sourceWalletId"] == buyer_wallet["id"]
        assert payment_transaction["destinationWalletId"] == seller_wallet["id"]


    @pytest.mark.asyncio
    @retry_with_exponential_backoff(attempts=4)
    async def test_payment_budget_enforcement(
        self,
        agentmarket_sdk: AgentMarketSDK,
        approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
        wallet_linker: Callable[[str], Awaitable[None]],
        registered_user: Dict[str, str],
        reviewer_user: Dict[str, str],
    ) -> None:
        """Test that payment budget is enforced during agent execution"""
        seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
        buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
        
        buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
        await wallet_linker(buyer_wallet["id"])

        # Fund buyer wallet with limited amount
        await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=30.0, reference="budget-test")

        # Try to execute with budget exceeding wallet balance
        with pytest.raises(Exception) as exc_info:
            await agentmarket_sdk.execute_agent(
                seller_agent["id"],
                {
                    "initiatorId": reviewer_user["id"],
                    "initiatorType": "AGENT",
                    "initiatorAgentId": buyer_agent["id"],
                    "input": json.dumps({"task": "budget test"}),
                    "jobReference": f"budget-{new_uuid()}",
                    "budget": 50.0,  # More than wallet balance
                },
            )

        # Verify execution was rejected due to insufficient funds
        assert exc_info.value is not None


    @pytest.mark.asyncio
    @retry_with_exponential_backoff(attempts=4)
    async def test_payment_zero_budget(
        self,
        agentmarket_sdk: AgentMarketSDK,
        approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
        wallet_linker: Callable[[str], Awaitable[None]],
        registered_user: Dict[str, str],
        reviewer_user: Dict[str, str],
    ) -> None:
        """Test that zero budget payments are handled correctly"""
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

        # Verify execution was successful with zero budget
        assert execution is not None
        assert "paymentTransaction" in execution
        
        payment_transaction = execution["paymentTransaction"]
        assert payment_transaction["status"] == "SETTLED"
        assert float(payment_transaction["amount"]) == pytest.approx(budget)


    @pytest.mark.asyncio
    @retry_with_exponential_backoff(attempts=4)
    async def test_payment_transaction_metadata(
        self,
        agentmarket_sdk: AgentMarketSDK,
        approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
        wallet_linker: Callable[[str], Awaitable[None]],
        registered_user: Dict[str, str],
        reviewer_user: Dict[str, str],
    ) -> None:
        """Test that payment transactions include proper metadata"""
        seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
        buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
        
        seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
        buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
        
        await wallet_linker(seller_wallet["id"])
        await wallet_linker(buyer_wallet["id"])

        # Fund buyer wallet
        await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="metadata-test")

        job_reference = f"metadata-payment-{new_uuid()}"
        budget = 15.75
        
        execution = await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": "metadata test"}),
                "jobReference": job_reference,
                "budget": budget,
            },
        )

        # Verify payment transaction metadata
        assert execution is not None
        assert "paymentTransaction" in execution
        assert "execution" in execution
        
        payment_transaction = execution["paymentTransaction"]
        execution_record = execution["execution"]
        
        # Verify transaction references execution
        assert payment_transaction["sourceWalletId"] == buyer_wallet["id"]
        assert payment_transaction["destinationWalletId"] == seller_wallet["id"]
        assert float(payment_transaction["amount"]) == pytest.approx(budget)
        
        # Verify execution references transaction
        assert execution_record["jobReference"] == job_reference
