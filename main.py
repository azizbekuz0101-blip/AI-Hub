"""
Точка входа в бот ObunaHub.
"""

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from config import settings
from database.engine import create_all_tables

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("bot.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)


async def main():
    logger.info("Запуск бота ObunaHub...")
    await create_all_tables()

    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher(storage=MemoryStorage())

    # ── Мидлвари ────────────────────────────────────────────────────
    from middlewares.antiflood import AntiFloodMiddleware
    from middlewares.db_middleware import DbSessionMiddleware
    from middlewares.ban_check import BanCheckMiddleware
    from middlewares.sub_check import SubscriptionCheckMiddleware

    dp.message.middleware(AntiFloodMiddleware(throttle_time=1.0))
    dp.callback_query.middleware(AntiFloodMiddleware(throttle_time=0.5))
    dp.message.middleware(DbSessionMiddleware())
    dp.callback_query.middleware(DbSessionMiddleware())
    dp.message.middleware(BanCheckMiddleware())
    dp.callback_query.middleware(BanCheckMiddleware())
    dp.message.middleware(SubscriptionCheckMiddleware())
    dp.callback_query.middleware(SubscriptionCheckMiddleware())

    # ── Роутеры админ-части (в начале — выше приоритет) ─────────────
    from handlers.admin.main import router as admin_main_router
    from handlers.admin.banner import router as banner_router
    from handlers.admin.add_product import router as add_product_router
    from handlers.admin.products import router as products_router
    from handlers.admin.categories import router as categories_router
    from handlers.admin.orders import router as orders_router
    from handlers.admin.statistics import router as statistics_router
    from handlers.admin.broadcast import router as broadcast_router
    from handlers.admin.admin_settings import router as settings_router

    # ── Роутеры пользовательской части ──────────────────────────────
    from handlers.user.start import router as user_start_router
    from handlers.user.catalog import router as catalog_router
    from handlers.user.purchase import router as purchase_router
    from handlers.user.stock import router as stock_router
    from handlers.user.info import router as info_router

    dp.include_router(admin_main_router)
    dp.include_router(banner_router)
    dp.include_router(add_product_router)
    dp.include_router(products_router)
    dp.include_router(categories_router)
    dp.include_router(orders_router)
    dp.include_router(statistics_router)
    dp.include_router(broadcast_router)
    dp.include_router(settings_router)

    dp.include_router(user_start_router)
    dp.include_router(catalog_router)
    dp.include_router(purchase_router)
    dp.include_router(stock_router)
    dp.include_router(info_router)

    logger.info(f"Все роутеры зарегистрированы. Администраторы: {settings.ADMIN_IDS}")
    await bot.delete_webhook(drop_pending_updates=True)
    logger.info("Бот запущен, ожидаю сообщения...")

    try:
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await bot.session.close()
        logger.info("Бот остановлен.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Остановлен вручную (Ctrl+C)")
