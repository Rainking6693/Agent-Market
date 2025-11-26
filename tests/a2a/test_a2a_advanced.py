"""
A2A Advanced Tests - Ported from Genesis-Rebuild

Advanced tests for A2A functionality:
- Edge cases
- Complex scenarios
- Performance tests
- Stress tests
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
async def test_a2a_execution_with_maximum_budget(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with maximum budget value"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet with large amount
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=10000.0, reference="max-budget-test")

    # Use maximum reasonable budget
    max_budget = 9999.99
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "max budget test"}),
            "jobReference": f"max-budget-{new_uuid()}",
            "budget": max_budget,
        },
    )

    # Verify execution was successful
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    payment_transaction = execution["paymentTransaction"]
    assert payment_transaction["status"] == "SETTLED"
    assert float(payment_transaction["amount"]) == pytest.approx(max_budget)


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_special_characters_in_input(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with special characters in input"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="special-chars-test")

    # Input with special characters
    special_input = {
        "task": "Special chars test: !@#$%^&*()_+-=[]{}|;':\",./<>?",
        "unicode": "Unicode test: 你好世界 🌍🚀",
        "emoji": "Emoji test: 😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾"
    }
    
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps(special_input),
            "jobReference": f"special-chars-{new_uuid()}",
            "budget": 15.0,
        },
    )

    # Verify execution was successful
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    execution_record = execution["execution"]
    assert execution_record["status"] == "SUCCESS"


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_nested_job_references(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with nested/hierarchical job references"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="nested-ref-test")

    # Hierarchical job reference
    nested_job_ref = f"workflow.parent.child.{new_uuid()}.subtask.123"
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({"task": "nested reference test"}),
            "jobReference": nested_job_ref,
            "budget": 20.0,
        },
    )

    # Verify execution was successful and job reference preserved
    assert execution is not None
    assert "execution" in execution
    
    execution_record = execution["execution"]
    assert execution_record["jobReference"] == nested_job_ref


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_multiple_wallet_transfers(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution involving multiple wallet transfers"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet with substantial amount
    initial_amount = 1000.0
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=initial_amount, reference="multi-transfer-test")

    # Execute multiple transactions
    transactions = [
        {"budget": 50.0, "ref": f"transfer-1-{new_uuid()}"},
        {"budget": 75.25, "ref": f"transfer-2-{new_uuid()}"},
        {"budget": 30.50, "ref": f"transfer-3-{new_uuid()}"},
    ]
    
    executions = []
    for tx in transactions:
        execution = await agentmarket_sdk.execute_agent(
            seller_agent["id"],
            {
                "initiatorId": reviewer_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": buyer_agent["id"],
                "input": json.dumps({"task": f"multi transfer {tx['ref']}"}),
                "jobReference": tx["ref"],
                "budget": tx["budget"],
            },
        )
        executions.append(execution)

    # Verify all executions were successful
    total_spent = sum(tx["budget"] for tx in transactions)
    for execution in executions:
        assert execution is not None
        assert "paymentTransaction" in execution
        payment_transaction = execution["paymentTransaction"]
        assert payment_transaction["status"] == "SETTLED"
    
    # Verify final wallet balance
    final_buyer_wallet = await agentmarket_sdk.get_wallet(buyer_wallet["id"])
    final_balance = float(final_buyer_wallet["balance"])
    expected_balance = initial_amount - total_spent
    assert pytest.approx(final_balance, 0.01) == expected_balance


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_long_running_task_simulation(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with simulation of long-running task"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="long-task-test")

    # Complex input simulating a long-running task
    complex_input = {
        "task": "complex analysis",
        "data": [{"id": i, "value": f"data_point_{i}"} for i in range(100)],
        "processing_steps": [
            "data_ingestion",
            "preprocessing",
            "analysis",
            "model_training",
            "validation",
            "report_generation"
        ],
        "parameters": {
            "iterations": 1000,
            "timeout": 300,
            "precision": 0.95
        }
    }
    
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps(complex_input),
            "jobReference": f"long-running-{new_uuid()}",
            "budget": 35.0,
        },
    )

    # Verify execution was successful despite complexity
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    execution_record = execution["execution"]
    assert execution_record["status"] == "SUCCESS"
    payment_transaction = execution["paymentTransaction"]
    assert payment_transaction["status"] == "SETTLED"


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_cross_user_validation(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test cross-user validation in A2A execution"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Seller")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    seller_wallet = await agentmarket_sdk.ensure_agent_wallet(seller_agent["id"])
    buyer_wallet = await agentmarket_sdk.ensure_agent_wallet(buyer_agent["id"])
    
    await wallet_linker(seller_wallet["id"])
    await wallet_linker(buyer_wallet["id"])

    # Fund buyer wallet
    await agentmarket_sdk.fund_wallet(buyer_wallet["id"], amount=50.0, reference="cross-user-test")

    # Execute with cross-user validation
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps({
                "task": "cross-user validation test",
                "validate_creator": registered_user["id"],
                "validate_reviewer": reviewer_user["id"]
            }),
            "jobReference": f"cross-user-{new_uuid()}",
            "budget": 18.75,
        },
    )

    # Verify execution was successful with proper cross-user handling
    assert execution is not None
    assert "execution" in execution
    
    execution_record = execution["execution"]
    assert execution_record["initiatorId"] == reviewer_user["id"]
    assert execution_record["initiatorAgentId"] == buyer_agent["id"]
    assert execution_record["agentId"] == seller_agent["id"]
    
    payment_transaction = execution["paymentTransaction"]
    assert payment_transaction["status"] == "SETTLED"
    assert payment_transaction["sourceWalletId"] == buyer_wallet["id"]
    assert payment_transaction["destinationWalletId"] == seller_wallet["id"]
