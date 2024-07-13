Mainnet

/opt/homebrew/opt/postgresql@15/bin/pg_dump -h db.radix.live -p 5432 -U radix -F c -b -v -f radix-mainnet.backup radix_ledger


/opt/homebrew/opt/postgresql@15/bin/psql -U radix -h db.radix.live -d radix_ledger

SELECT pg_size_pretty(pg_database_size('radix_ledger')) AS database_size;


Stokenet

/opt/homebrew/opt/postgresql@15/bin/pg_dump -h stokenet-db.radix.live -p 5432 -U radix -F c -b -v -f radix-stokenet.backup radix_ledger


/opt/homebrew/opt/postgresql@15/bin/psql -U radix -h stokenet-db.radix.live -d radix_ledger

SELECT pg_size_pretty(pg_database_size('radix_ledger')) AS database_size;
