"""
Legacy database module for backward compatibility.
This module will be deprecated once all imports are updated to use core.database.
"""

from core.database import db_manager, serialize_doc, serialize_docs
from core.config import settings

# Legacy compatibility exports
client = None  # Will be set after connection
db = None      # Will be set after connection


async def initialize_legacy_db():
    """Initialize legacy database references."""
    global client, db
    if db_manager.database is None:
        await db_manager.connect()
    client = db_manager.client
    db = db_manager.database


# Ensure database is connected when this module is imported
import asyncio
try:
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # If we're in an async context, schedule the initialization
        asyncio.create_task(initialize_legacy_db())
    else:
        # If we're not in an async context, run it
        loop.run_until_complete(initialize_legacy_db())
except RuntimeError:
    # No event loop, will be initialized later
    pass


async def get_database():
    """Legacy function for backward compatibility."""
    if db_manager.database is None:
        await db_manager.connect()
    return db_manager.database