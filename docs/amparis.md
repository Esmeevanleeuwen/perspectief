# Publiceren op Amparis

Avera heet voortaan **Amparis**. In het publicatiepaneel staat daarom Publiceren op Amparis. De uitleg bij artikelinstellingen, de openbare artikelnavigatie en de uitgeversnaam in gestructureerde metadata gebruiken ook de nieuwe naam. De naamswijziging wordt vastgelegd in `202609190001_rebrand_amparis.sql`.

De bestaande platformsleutel `avera` blijft behouden. De database krijgt geen tweede kanaal: artikelen, verslagen, hoofdstukken, bewaarde instellingen en revisies blijven aan dezelfde identiteit gekoppeld. De publieke API blijft daarom `platform=avera` accepteren. Voor Amparis verandert uitsluitend de zichtbare naam; toegangsrechten, publicatiestatussen en de Meridian-naam blijven ongewijzigd.

De volledige nieuwe domeinnaam is nog niet bevestigd. De migratie verandert daarom alleen `publishing_sites.label`, niet `origin`. Er zijn geen DNS-records, redirects of hostinginstellingen gewijzigd. Als het volledige HTTPS-adres bekend is, wordt het ingesteld voor de bestaande platformsleutel en gekoppeld aan de Amparis-hosting. De Amparis-deployment gebruikt hetzelfde adres bij `NEXT_PUBLIC_SITE_URL`.

Deze naamswijziging activeert niet de eerdere migratie `202609180002_activate_shared_publishing.sql`. De uitrolvolgorde daarvan blijft zoals beschreven in `shared-publishing.md`. Oudere verwijzingen naar Avera in die documentatie betreffen hetzelfde platform onder de vorige naam.
