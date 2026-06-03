-- Reptile & other pets channel: extend app_channel enum.
-- Apply seed in 011_reptile_channel_seed.sql (enum value must commit first).

alter type public.app_channel add value if not exists 'reptile';
