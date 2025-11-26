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
import asyncio
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


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_with_dependency_chain(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with dependency chain between agents"""
    # Create three agents in a chain: Agent1 -> Agent2 -> Agent3
    agent1 = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Agent1")
    agent2 = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Agent2")
    agent3 = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="Agent3")
    
    # Ensure wallets for all agents
    wallet1 = await agentmarket_sdk.ensure_agent_wallet(agent1["id"])
    wallet2 = await agentmarket_sdk.ensure_agent_wallet(agent2["id"])
    wallet3 = await agentmarket_sdk.ensure_agent_wallet(agent3["id"])
    
    await wallet_linker(wallet1["id"])
    await wallet_linker(wallet2["id"])
    await wallet_linker(wallet3["id"])

    # Fund the first agent's wallet
    await agentmarket_sdk.fund_wallet(wallet1["id"], amount=100.0, reference="dependency-chain-test")

    # Execute first agent
    budget1 = 30.0
    execution1 = await agentmarket_sdk.execute_agent(
        agent1["id"],
        {
            "initiatorId": registered_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": agent1["id"],
            "input": json.dumps({"task": "first in chain"}),
            "jobReference": f"chain-1-{new_uuid()}",
            "budget": budget1,
        },
    )

    # Execute second agent with result from first
    budget2 = 25.0
    execution2 = await agentmarket_sdk.execute_agent(
        agent2["id"],
        {
            "initiatorId": registered_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": agent1["id"],
            "input": json.dumps({"task": "second in chain", "previous_result": execution1.get("result", "")}),
            "jobReference": f"chain-2-{new_uuid()}",
            "budget": budget2,
        },
    )

    # Execute third agent with result from second
    budget3 = 20.0
    execution3 = await agentmarket_sdk.execute_agent(
        agent3["id"],
        {
            "initiatorId": registered_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": agent2["id"],
            "input": json.dumps({"task": "third in chain", "previous_result": execution2.get("result", "")}),
            "jobReference": f"chain-3-{new_uuid()}",
            "budget": budget3,
        },
    )

    # Verify all executions were successful
    assert execution1 is not None
    assert execution2 is not None
    assert execution3 is not None
    
    payment_transaction1 = execution1["paymentTransaction"]
    payment_transaction2 = execution2["paymentTransaction"]
    payment_transaction3 = execution3["paymentTransaction"]
    
    assert payment_transaction1["status"] == "SETTLED"
    assert payment_transaction2["status"] == "SETTLED"
    assert payment_transaction3["status"] == "SETTLED"
    
    assert float(payment_transaction1["amount"]) == pytest.approx(budget1)
    assert float(payment_transaction2["amount"]) == pytest.approx(budget2)
    assert float(payment_transaction3["amount"]) == pytest.approx(budget3)


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_error_handling(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution error handling with invalid parameters"""
    # Create an agent
    agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="ErrorTest")
    
    # Test with missing required parameters
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            agent["id"],
            {
                # Missing required initiatorId
                "input": json.dumps({"task": "test missing params"}),
                "jobReference": f"error-test-{new_uuid()}",
                "budget": 10.0,
            },
        )

    response = error_info.value.response
    assert response.status_code == 400 or response.status_code == 422

    # Test with invalid agent ID
    with pytest.raises(httpx.HTTPStatusError) as error_info:
        await agentmarket_sdk.execute_agent(
            "invalid-agent-id",
            {
                "initiatorId": registered_user["id"],
                "input": json.dumps({"task": "test invalid agent"}),
                "jobReference": f"error-test-{new_uuid()}",
                "budget": 10.0,
            },
        )

    response = error_info.value.response
    assert response.status_code == 404 or response.status_code == 400


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_large_input_handling(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test A2A execution with large input data"""
    seller_agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix="LargeInput")
    buyer_agent = await approved_agent_factory(creator_id=reviewer_user["id"], name_prefix="Buyer")
    
    # Create large input data (simulate complex task with lots of data)
    large_data = [{"id": i, "value": f"data_item_{i}"} for i in range(1000)]
    large_input = {
        "task": "process large dataset",
        "data": large_data,
        "metadata": {
            "source": "large_data_test",
            "timestamp": "2025-01-01T00:00:00Z",
            "version": "1.0"
        }
    }
    
    budget = 25.0
    execution = await agentmarket_sdk.execute_agent(
        seller_agent["id"],
        {
            "initiatorId": reviewer_user["id"],
            "initiatorType": "AGENT",
            "initiatorAgentId": buyer_agent["id"],
            "input": json.dumps(large_input),
            "jobReference": f"large-input-{new_uuid()}",
            "budget": budget,
        },
    )

    # Verify execution was successful despite large input
    assert execution is not None
    assert "execution" in execution
    assert "paymentTransaction" in execution
    
    execution_record = execution["execution"]
    payment_transaction = execution["paymentTransaction"]
    
    assert execution_record["status"] == "SUCCESS"
    assert payment_transaction["status"] == "SETTLED"
    assert float(payment_transaction["amount"]) == pytest.approx(budget)


@pytest.mark.asyncio
@retry_with_exponential_backoff(attempts=4)
async def test_a2a_execution_concurrent_agents(
    agentmarket_sdk: AgentMarketSDK,
    approved_agent_factory: Callable[..., Awaitable[Dict[str, object]]],
    wallet_linker: Callable[[str], Awaitable[None]],
    registered_user: Dict[str, str],
    reviewer_user: Dict[str, str],
) -> None:
    """Test concurrent execution of multiple agents"""
    # Create multiple agents
    agents = []
    for i in range(5):
        agent = await approved_agent_factory(creator_id=registered_user["id"], name_prefix=f"ConcurrentAgent{i}")
        agents.append(agent)
    
    # Execute all agents concurrently with different budgets
    tasks = []
    for i, agent in enumerate(agents):
        budget = 10.0 + i * 5.0  # Different budgets: 10, 15, 20, 25, 30
        task = agentmarket_sdk.execute_agent(
            agent["id"],
            {
                "initiatorId": registered_user["id"],
                "initiatorType": "AGENT",
                "initiatorAgentId": agent["id"],
                "input": json.dumps({"task": f"concurrent execution {i}"}),
                "jobReference": f"concurrent-{i}-{new_uuid()}",
                "budget": budget,
            },
        )
        tasks.append(task)
    
    # Wait for all executions to complete
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Verify all executions were successful
    successful_executions = [result for result in results if not isinstance(result, Exception)]
    assert len(successful_executions) == len(agents)
    
    # Verify payment transactions
    total_spent = 0.0
    for result in successful_executions:
        payment_transaction = result["paymentTransaction"]
        assert payment_transaction["status"] == "SETTLED"
        total_spent += float(payment_transaction["amount"])
    
    expected_total = sum([10.0 + i * 5.0 for i in range(5)])  # 100.0
    assert pytest.approx(total_spent) == expected_total
