"""
Security Tests - Ported from Genesis-Rebuild

Tests security aspects of the Agent Market platform:
- Authentication and authorization
- Input validation
- Credential protection
- Path traversal prevention
"""

from __future__ import annotations

import pytest
from typing import Dict

from agentmarket_testkit.sdk import AgentMarketSDK
from agentmarket_testkit.utils import unique_email


class TestAuthenticationSecurity:
    """"Test suite for authentication security"""

    @pytest.mark.asyncio
    async def test_user_registration_with_valid_credentials(self) -> None:
        """Test user registration with valid credentials"""
        async with AgentMarketSDK() as sdk:
            email = unique_email()
            display_name = "Security Test User"
            password = "SecurePassword123!"
            
            # Register user
            response = await sdk.register_user(
                email=email,
                display_name=display_name,
                password=password
            )
            
            # Verify successful registration
            assert response is not None
            assert "user" in response
            user = response["user"]
            assert user["email"] == email
            assert user["displayName"] == display_name
            # Password should not be returned
            assert "password" not in user

    @pytest.mark.asyncio
    async def test_user_login_with_valid_credentials(self) -> None:
        """Test user login with valid credentials"""
        async with AgentMarketSDK() as sdk:
            email = unique_email()
            display_name = "Login Test User"
            password = "SecurePassword123!"
            
            # Register user first
            await sdk.register_user(
                email=email,
                display_name=display_name,
                password=password
            )
            
            # Login with same credentials
            response = await sdk.login(
                email=email,
                password=password
            )
            
            # Verify successful login
            assert response is not None
            assert "user" in response
            assert "token" in response
            user = response["user"]
            assert user["email"] == email
            assert user["displayName"] == display_name

    @pytest.mark.asyncio
    async def test_user_login_with_invalid_password(self) -> None:
        """Test user login fails with invalid password"""
        async with AgentMarketSDK() as sdk:
            email = unique_email()
            display_name = "Invalid Password Test User"
            correct_password = "CorrectPassword123!"
            wrong_password = "WrongPassword123!"
            
            # Register user first
            await sdk.register_user(
                email=email,
                display_name=display_name,
                password=correct_password
            )
            
            # Try to login with wrong password
            with pytest.raises(Exception) as exc_info:
                await sdk.login(
                    email=email,
                    password=wrong_password
                )
            
            # Verify login failed
            assert exc_info.value is not None

    @pytest.mark.asyncio
    async def test_user_login_with_nonexistent_user(self) -> None:
        """Test user login fails with nonexistent user"""
        async with AgentMarketSDK() as sdk:
            email = unique_email()
            password = "SomePassword123!"
            
            # Try to login with nonexistent user
            with pytest.raises(Exception) as exc_info:
                await sdk.login(
                    email=email,
                    password=password
                )
            
            # Verify login failed
            assert exc_info.value is not None


class TestInputValidation:
    """"Test suite for input validation security"""

    @pytest.mark.asyncio
    async def test_user_registration_with_malformed_email(self) -> None:
        """Test user registration fails with malformed email"""
        async with AgentMarketSDK() as sdk:
            malformed_emails = [
                "not-an-email",
                "@invalid.com",
                "user@",
                "user@.com",
                "user@@domain.com"
            ]
            
            for email in malformed_emails:
                with pytest.raises(Exception) as exc_info:
                    await sdk.register_user(
                        email=email,
                        display_name="Test User",
                        password="SecurePassword123!"
                    )
                
                # Verify registration failed
                assert exc_info.value is not None

    @pytest.mark.asyncio
    async def test_user_registration_with_short_password(self) -> None:
        """Test user registration fails with short password"""
        async with AgentMarketSDK() as sdk:
            short_passwords = [
                "123",
                "pass",
                "short"
            ]
            
            for password in short_passwords:
                with pytest.raises(Exception) as exc_info:
                    await sdk.register_user(
                        email=unique_email(),
                        display_name="Test User",
                        password=password
                    )
                
                # Verify registration failed
                assert exc_info.value is not None
