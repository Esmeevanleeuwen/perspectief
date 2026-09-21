# JPEG vervangen en een normaal artikel tonen

Open **Admin → Publicaties → Instellingen** bij een artikel. **Afbeelding en artikelweergave** staat direct boven de tekstformulieren, niet meer alleen in een publicatievenster.

Kies bij **Afbeelding vanaf je apparaat** een JPG/JPEG. De bestaande foto blijft staan totdat de upload is gelukt. De nieuwe foto verschijnt als voorbeeld. PNG en WebP blijven ondersteund. Bij **Weergave voor lezers** kies je per website **Normaal artikel — zonder hoofdstuknavigatie** of **Artikel met hoofdstuknavigatie**. Klik op **Publiceer op Meridian** om de afbeelding, weergave en opgeslagen tekst live te zetten.

**Als concept opslaan** bewaart de foto en weergave zonder de live versie te veranderen. Sla gewijzigde tekstformulieren eerst op voor je publiceert. Een versieconflict vraagt om de laatste versie; nieuwere tekst wordt niet stilzwijgend gepubliceerd. Uploadfouten, dubbele kliks en nog lopende uploads mogen geen oude foto overschrijven of een onvolledige publicatie veroorzaken.

Normaal artikel verbergt verslagnaam, hoofdstuknavigatie, vorige/volgende-links en de verslagverwijzing in de zoekmachinegegevens. Het artikel verschijnt niet meer als hoofdstuk in de openbare inhoudsopgave van die website. Interne verslagindeling, tekst, tussenkoppen, stabiele artikel-URL en links in de tekst blijven bestaan. Alle hoofdstukken als normaal artikel publiceren maakt de bijbehorende openbare verslagpagina onbeschikbaar; de interne indeling blijft bewaard. De keuze geldt pas na publiceren en is per website afzonderlijk instelbaar.

Voor bestaande artikelen blijft de oude weergave actief totdat de redacteur de keuze wijzigt en publiceert. Deze uitrol wijzigt geen bestaande artikelen of hoofdstukken. Onderzoeken blijven hun eigen onderzoeksweergave gebruiken, maar krijgen eveneens een bestandskiezer voor hun afbeelding in het formulier.

De nieuwe foto wordt onder een nieuw bestandsadres opgeslagen. Oude afbeeldingen en privébuckets worden niet verwijderd. Artikelafbeeldingen zijn openbaar via hun link, ook bij een concept. Upload geen vertrouwelijke bronnen.

## Techniek

De bestaande uploadcomponent, bucket, rollencontrole en versiegebonden publicatiefuncties blijven in gebruik. `show_chapters` is een optionele boolean per website; ontbrekend betekent de bestaande hoofdstukweergave. De openbare instellingen zijn expliciet begrensd. Publicaties gebruiken alleen vrijgegeven instellingen, nooit de conceptconfiguratie. Migratie `20260921210000_article_display.sql` verandert geen bestaande rijen en verbreedt geen toegangsrechten.

Tests gebruiken lokale databasefixtures en nagebootste browsersessies. Een upload vanuit het eigen ingelogde productieaccount is niet onderdeel van de automatische controle.
