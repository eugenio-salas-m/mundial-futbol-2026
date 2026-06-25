-- ===========================================================
-- Mundial Futbol 2026
-- Security Migration
--
-- Enables Row Level Security (RLS) on all public tables.
--
-- This migration is maintained manually because Prisma
-- does not manage PostgreSQL RLS policies.
-- ===========================================================

DO $$
DECLARE
    t text;
BEGIN

    FOREACH t IN ARRAY ARRAY[
        'achievements',
        'activity_feed_events',
        'invitations',
        'match_results',
        'matches',
        'notification_logs',
        'notification_preferences',
        'organization_requests',
        'organizations',
        'predictions',
        'ranking_daily_summaries',
        'ranking_snapshots',
        'scores',
        'teams',
        'user_achievements',
        'user_standings',
        'users'
    ]
    LOOP

        EXECUTE format(
            'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;',
            t
        );

        EXECUTE format(
            'CREATE POLICY "deny_all"
             ON public.%I
             FOR ALL
             USING (false)
             WITH CHECK (false);',
            t
        );

    END LOOP;

END $$;