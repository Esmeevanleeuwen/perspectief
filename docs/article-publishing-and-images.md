# Artikelen publiceren en foto's uploaden

In de Werkplek en bij de publicatie-instellingen staat nu **Publiceren** naast het bestaande structuurpaneel. Deze knop opent een klein scherm met websitekeuze, afbeelding, alt-tekst en **Publiceer op …**. Gewijzigde instellingen worden eerst opgeslagen; publiceren gebruikt daarna die versie. Artikeltekst moet eerst met Concept opslaan zijn bewaard. De bestaande databasefuncties blijven versieconflicten, rechten en platformkeuze controleren. SEO, hoofdstukken en offline halen blijven in Structuur & publicatie.

Bij een nieuw artikel staan titel, samenvatting en de upload bovenaan. Type, label, webadres en ondertitel staan onder Meer instellingen. Het bestaande formulier maakt alleen een concept aan.

JPG/JPEG, PNG en WebP kunnen vanaf een computer of telefoon worden gekozen. De browser controleert de bestandsbytes, opent de afbeelding en verwerkt hem tot maximaal 2400 pixels aan de langste zijde. De upload gaat rechtstreeks met de ingelogde Supabase-sessie naar Storage, niet via een grote Next.js Server Action. Bronbestanden mogen maximaal 20 MB zijn; opgeslagen bestanden maximaal 6 MB. Een geslaagde upload verschijnt als voorbeeld. Mislukte uploads vervangen de oude afbeelding niet en lopende uploads blokkeren opslaan/publiceren.

## Opslag en privacy

Migratie `20260921150000_article_images.sql` maakt alleen de nieuwe publieke bucket `article-images` aan. Upload is uitsluitend toegestaan aan `is_editorial()` (momenteel eigenaar en redacteur), onder het eigen gebruikers-ID met een nieuwe UUID-bestandsnaam. Er zijn geen overschrijf- of verwijderrechten. Bestaande privébuckets blijven onaangeroerd. Afbeeldingen zijn via hun URL publiek zodra ze zijn geüpload, ook bij een concept; de interface meldt dit expliciet. Upload hier geen vertrouwelijke bronnen. Een afbeelding weghalen wist alleen de gekozen URL, niet een bestand dat mogelijk nog bij een gepubliceerde versie hoort. Ongebruikte uploads worden niet automatisch opgeruimd.

## Controles

`node --test tests/article-image.test.mjs tests/quick-publish.test.mjs tests/publishing-panel.test.mjs`

De tests controleren bestandstypes, formaatgrenzen, rechten in de migratie, conceptopslag, versieconflicten, platformselectie, uploadfouten en te vroeg opslaan. De bestaande configured-publishing workflow voert ze samen met de bestaande regressietests en build uit. Een echte upload met een ingelogd redactieaccount blijft de laatste live controle.
