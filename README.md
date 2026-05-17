# CRM система для вывоза мусора

Современная, минималистичная CRM система для управления сделками по вывозу мусора в Санкт-Петербурге и Москве.

## Функциональность (MVP)

- **Kanban доска**: 8 стадий сделок (новая → выполненная)
- **Карточка сделки**: все поля с автосохранением
- **Финансы**: автоматический расчёт прибыли и % менеджера
- **Роли**: администратор (Кирилл) и менеджер (Владислав)
- **Калькулятор**: встроенный iframe

## Стек

- Next.js 14 + React 19 + TypeScript
- Tailwind CSS (тёмная тема)
- PostgreSQL + Prisma
- NextAuth.js v5
- Railway deployment

## Старт

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Логин: `kirill@example.com` / `kirill123`

Читайте подробный план в `/home/kirill/.claude/plans/breezy-sparking-sprout.md`
