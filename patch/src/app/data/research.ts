export type ResearchSection = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  paragraphs: string[];
  points?: string[];
};

export type Research = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  dimensions: string[];
  question: string;
  method: string;
  sections: ResearchSection[];
};

export const research: Research[] = [
  {
    slug: "tegenspraak",
    label: "ONDERZOEK",
    title: "Wat gebeurt er met tegenspraak?",
    summary:
      "Van waarschuwing en advies tot kabinetsbesluit: we reconstrueren welke informatie binnenkomt, welke informatie verandert en welke informatie onderweg uit beeld raakt.",
    image: "/onderzoek-tegenspraak.jpg",
    imageAlt:
      "Mensen bewegen in het donker langs een steile helling tijdens de gebeurtenissen rond Ceuta.",
    featured: true,
    dimensions: ["Adviezen", "Documenten", "Perspectieven", "Besluiten"],
    question:
      "Hoe wordt maatschappelijke tegenspraak verwerkt voordat beleid een besluit wordt?",
    method:
      "We volgen niet één mening, maar de route van informatie: van ervaring en waarschuwing naar document, afweging, besluit en gevolg.",
    sections: [
      {
        id: "vraag",
        eyebrow: "De vraag",
        title: "Tegenspraak is meer dan voor of tegen.",
        intro:
          "Een waarschuwing kan gehoord worden zonder te worden gevolgd. Een advies kan worden verwerkt zonder dat het voorstel verandert. En informatie kan openbaar zijn zonder werkelijk zichtbaar te worden.",
        paragraphs: [
          "Dit onderzoek probeert daarom niet vooraf te bewijzen dat een kabinet wel of niet luistert. We reconstrueren eerst wat er beschikbaar was, wie welke informatie aandroeg, hoe daarop werd gereageerd en welke argumenten uiteindelijk in het besluit terugkomen.",
          "Daarbij onderscheiden we de inhoud van een waarschuwing, de reactie erop en de uiteindelijke politieke keuze. Alleen zo wordt zichtbaar waar verschil van inzicht normaal onderdeel van besluitvorming is en waar de informatieroute zelf onduidelijk wordt.",
        ],
      },
      {
        id: "route",
        eyebrow: "De informatieroute",
        title: "Van signaal naar gevolg.",
        paragraphs: [
          "Voor ieder deelonderzoek volgen we dezelfde beweging. Een ervaring, gebeurtenis of waarschuwing wordt eerst een signaal. Dat signaal kan worden vastgelegd in een advies, rapport, Kamervraag, consultatiereactie of ander document. Daarna onderzoeken we waar het in de besluitvorming terechtkomt.",
          "Vervolgens kijken we of het argument aantoonbaar wordt meegenomen, gedeeltelijk wordt verwerkt, inhoudelijk wordt verworpen of niet meer goed te reconstrueren is. Pas daarna kijken we naar het besluit en de gevolgen ervan.",
        ],
        points: [
          "Signaal — wat wordt gezien of ervaren?",
          "Vastlegging — waar wordt het gedocumenteerd?",
          "Afweging — wie reageert erop en met welke argumenten?",
          "Besluit — wat verandert er daadwerkelijk?",
          "Gevolg — wat betekent dat voor mensen en instituties?",
        ],
      },
      {
        id: "menselijke-laag",
        eyebrow: "Menselijke laag",
        title: "Een systeem wordt zichtbaar in individuele gevolgen.",
        paragraphs: [
          "De foto bij dit onderzoek komt uit de gebeurtenissen rond Ceuta in mei 2021. Zij is hier niet bedoeld als bewijs voor één politieke conclusie, maar als ingang naar een menselijke informatielaag: achter categorieën als grens, migratie, opvang en terugkeer bevinden zich mensen die ieder een ander deel van hetzelfde systeem meemaken.",
          "Daarom koppelen we het brede onderzoek naar tegenspraak aan concrete artikelen en casussen. Zo kan een beleidsvraag worden teruggebracht naar de mensen die de gevolgen ervaren, terwijl hun ervaring vervolgens weer wordt verbonden met documenten, regels en besluiten.",
        ],
      },
      {
        id: "transparantie",
        eyebrow: "Transparantie",
        title: "Beschikbaar is niet hetzelfde als zichtbaar.",
        paragraphs: [
          "Bij ieder dossier kijken we niet alleen of informatie formeel openbaar is. We onderzoeken ook of zij vindbaar, tijdig beschikbaar, begrijpelijk en herleidbaar is naar de uiteindelijke afweging.",
          "Wanneer een belangrijk document bestaat maar pas laat beschikbaar komt, verspreid staat over meerdere systemen of nauwelijks aan een besluit is te koppelen, is dat een andere informatiepositie dan wanneer de volledige afweging direct zichtbaar is.",
        ],
        points: [
          "Bestaat de informatie?",
          "Is zij bewaard?",
          "Is zij openbaar?",
          "Is zij vindbaar?",
          "Is zij begrijpelijk?",
          "Is zij terug te vinden in de uiteindelijke afweging?",
        ],
      },
      {
        id: "grens",
        eyebrow: "Onderzoeksgrens",
        title: "Wat we niet weten blijft zichtbaar.",
        paragraphs: [
          "Een ontbrekende verbinding wordt niet automatisch geïnterpreteerd als opzet, manipulatie of negeren. Soms is een afweging mondeling gemaakt, valt informatie buiten een formeel dossier of is een document nog niet beschikbaar.",
          "Juist daarom markeert Meridian onzekerheid als onderdeel van het onderzoek. Een vraagteken is geen lege plek die met een vermoeden moet worden gevuld, maar een concrete aanwijzing voor wat nog moet worden onderzocht.",
        ],
      },
    ],
  },

  {
  slug: "mannen-die-we-pas-zien-wanneer-ze-breken",
  label: "ONDERZOEK",
  title: "De mannen die we pas zien wanneer ze breken",
  summary:
    "Een onderzoek naar mannelijk slachtofferschap, arbeid, risico, zelfdoding, oorlog, commerciële selectie en de vraag waarom sommige vormen van kwetsbaarheid eerder als probleem, falen, gevaar of verantwoordelijkheid worden gelezen dan als menselijk verlies.",
  image: "/artikelsad.jpg",
  imageAlt:
    "Een jonge man alleen in een donkere omgeving, gebruikt als visuele ingang naar een onderzoek naar mannelijk slachtofferschap en maatschappelijke onzichtbaarheid.",
  featured: false,
  dimensions: [
    "Slachtofferschap",
    "Arbeid",
    "Psychische gezondheid",
    "Defensie",
    "Selectie",
    "Waarheidsvorming",
  ],
  question:
    "Wat gebeurt er wanneer mannen maatschappelijk eerder zichtbaar worden via hun functie, risico, gedrag of uitval dan via hun kwetsbaarheid?",
  method:
    "We vergelijken verschillende systemen zonder vooraf één schuldige of één ideologische conclusie aan te wijzen. We volgen cijfers, risico’s, institutionele prikkels, taal, selectie en hulpstructuren en onderzoeken steeds drie afzonderlijke lagen: wat aantoonbaar gebeurt, hoe het wordt benoemd en welke menselijke werkelijkheid daardoor minder zichtbaar kan worden.",
  sections: [
    {
      id: "niet-onzichtbaar-maar-anders-zichtbaar",
      eyebrow: "Het uitgangspunt",
      title: "Misschien zijn mannelijke slachtoffers niet onzichtbaar. Misschien zien we ze onder een andere naam.",
      intro:
        "Een mens kan volledig zichtbaar zijn in statistieken en tegelijkertijd nauwelijks zichtbaar zijn als slachtoffer.",
      paragraphs: [
        "Een man die sterft tijdens zijn werk kan verschijnen als arbeidsongeval. Een jongen die voortijdig stopt met onderwijs verschijnt als uitvaller. Een man zonder huis verschijnt als dakloze. Een gedetineerde verschijnt eerst als dader. Een militair die gevaar loopt verschijnt als operationele capaciteit. Een man die zichzelf doodt verschijnt uiteindelijk als één waarneming in een sterftestatistiek. Geen van deze categorieën is noodzakelijk onjuist. Het probleem begint wanneer de categorie bepaalt welke vragen daarna nog worden gesteld.",

        "De centrale hypothese van dit onderzoek is daarom niet dat mannen als groep worden verzwegen, en evenmin dat mannen overal slechter af zijn. De hypothese is smaller maar pijnlijker: sommige vormen van mannelijk lijden worden maatschappelijk gemakkelijker verwerkt wanneer zij kunnen worden vertaald naar functioneren, verantwoordelijkheid, risico, overlast, criminaliteit, economische activiteit of individuele keuze. Dezelfde persoon kan daardoor uitgebreid worden geregistreerd zonder dat de vraag wie hem beschermde, wat hij verloor of welke alternatieven werkelijk beschikbaar waren evenveel aandacht krijgt.",

        "Daarmee ontstaat een onderzoeksprobleem dat verder gaat dan sekse. Iedere samenleving heeft categorieën nodig. Politie moet onderscheid maken tussen verdachte en slachtoffer. Arbeidsinspecties moeten ongevallen registreren. Zorg moet symptomen classificeren. Defensie moet inzetbaarheid beoordelen. Statistiek kan niet iedere biografie meenemen. Maar iedere noodzakelijke reductie verwijdert informatie, en zodra verschillende reducties steeds bij dezelfde groepen terechtkomen kan een patroon ontstaan dat in geen enkele afzonderlijke dataset volledig zichtbaar is.",

        "De vraag wordt daarom niet alleen hoeveel mannen slachtoffer worden, maar ook: wanneer gebruiken wij überhaupt het woord slachtoffer?"
      ],
      points: [
        "Een feitelijke categorie kan correct zijn en toch menselijke informatie verliezen.",
        "Dader en slachtoffer zijn niet altijd wederzijds uitsluitende levensgeschiedenissen.",
        "Economisch voordeel en lichamelijk risico kunnen uit dezelfde positie voortkomen.",
        "Afwezigheid van een hulpvraag bewijst niet automatisch afwezigheid van hulpbehoefte.",
        "Een meerderheid kan op één dimensie voordeel hebben en op een andere dimensie aantoonbaar risico dragen."
      ],
    },

    {
      id: "selectieve-waarheid",
      eyebrow: "Waarheidsvorming",
      title: "Selectieve waarheid hoeft geen leugen te bevatten.",
      intro:
        "De gevaarlijkste vertekening bestaat niet altijd uit onjuiste informatie. Soms ontstaat zij doordat alleen bepaalde ware informatie voortdurend naast elkaar wordt gelegd.",
      paragraphs: [
        "Wanneer iemand wil aantonen dat mannen maatschappelijk machtig zijn, bestaan daarvoor ware gegevens. Wanneer iemand wil aantonen dat mannen bovengemiddeld blootstaan aan bepaalde vormen van lichamelijk gevaar, zelfdoding, detentie of risicowerk, bestaan daarvoor eveneens ware gegevens. Een selectief verhaal ontstaat wanneer één verzameling feiten wordt behandeld als verklaring van de volledige menselijke positie en de andere verzameling alleen nog als uitzondering, eigen keuze of irrelevant detail.",

        "Dat mechanisme is belangrijk omdat moderne politieke strijd zelden uitsluitend tussen waarheid en leugen plaatsvindt. Veel vaker bestaan tegenover elkaar twee verzamelingen werkelijk bestaande feiten. De strijd gaat vervolgens over welke feiten de hoofdcategorie mogen bepalen en welke feiten slechts als context worden toegestaan.",

        "Een jonge man kan bijvoorbeeld voordeel hebben doordat hij niet met bepaalde vormen van discriminatie wordt geconfronteerd en tegelijkertijd een grotere kans hebben om in een risicovol beroep terecht te komen. Het eerste wist het tweede niet uit. Het tweede wist het eerste niet uit. Zodra een theorie eist dat één van beide moet verdwijnen om de andere moreel serieus te kunnen nemen, wordt maatschappelijke analyse een wedstrijd om slachtofferschap in plaats van een onderzoek naar verschillende mechanismen.",

        "Meridian moet daarom juist zoeken naar feiten die de eigen eerste verklaring moeilijker maken. Niet omdat iedere positie even waar is, maar omdat een verklaring pas sterk wordt wanneer zij ook informatie kan overleven die niet voor haar geselecteerd was."
      ],
      points: [
        "Vraag niet alleen: is deze bewering waar?",
        "Vraag ook: welke andere ware gegevens veranderen haar betekenis?",
        "Maak onderscheid tussen groepsgemiddelde en individuele werkelijkheid.",
        "Laat causaliteit niet ontstaan uit morele voorkeur.",
        "Maak onzekerheid zichtbaar waar het bewijs stopt."
      ],
    },

    {
      id: "lichaam",
      eyebrow: "Arbeid en risico",
      title: "Het lichaam wordt vaak pas politiek wanneer het niet meer kan werken.",
      intro:
        "In productie is lichamelijke capaciteit waarde. Bij beschadiging verandert dezelfde capaciteit plotseling in letsel, ziekte, uitval en zorg.",
      paragraphs: [
        "De Nederlandse Arbeidsinspectie rondde in 2024 onderzoeken af naar 1.990 meldingsplichtige arbeidsongevallen met 2.001 slachtoffers. Daarbij overleden 58 mensen. Mannen zijn bij ernstige arbeidsongevallen structureel sterk oververtegenwoordigd, mede doordat zij vaker werken in sectoren zoals bouw, industrie, vervoer en andere werkzaamheden waarin lichamelijk gevaar groter is.",

        "Dat gegeven wordt gemakkelijk los gezien van een ander gegeven: jonge mannen werken gemiddeld meer betaalde uren dan jonge vrouwen en ontvangen daardoor gemiddeld een hoger jaarinkomen, terwijl het gemiddelde uurloon in de genoemde jonge leeftijdsgroepen vrijwel gelijk ligt. Hetzelfde arbeidsmodel kan dus tegelijkertijd iets produceren dat als economisch voordeel verschijnt en iets dat als lichamelijk risico verschijnt.",

        "Wanneer inkomen in het debat terechtkomt onder de categorie macht en een arbeidsongeval terechtkomt onder de categorie veiligheid, verdwijnen beide uitkomsten in verschillende maatschappelijke dossiers. Maar voor het lichaam van de werknemer waren zij onderdeel van dezelfde werkelijkheid: meer tijd verkopen, een bepaalde functie uitvoeren, inkomen ontvangen en blootstaan aan de risico’s die bij die functie horen.",

        "Een volwassen analyse kan daarom niet volstaan met de constatering dat mannen meer verdienen, maar ook niet met de constatering dat mannen vaker slachtoffer worden van zwaar werk. Zij moet de volledige waardestroom en risicostroom volgen. Wie ontvangt de economische opbrengst? Wie ontvangt het loon? Wie draagt lichamelijke slijtage? Wie betaalt wanneer iemand uitvalt? Welke partner of familie draagt een deel van de gevolgen? Welke kosten worden pas jaren later zichtbaar?",

        "Pas dan verschijnt de mens achter de arbeidsstatistiek."
      ],
    },

    {
      id: "zelfdoding",
      eyebrow: "Psychische gezondheid",
      title: "De statistiek telt hem uiteindelijk wel.",
      intro:
        "Sommige mensen worden pas volledig zichtbaar voor een systeem op het moment dat iedere eerdere mogelijkheid tot hulp verdwenen is.",
      paragraphs: [
        "In 2025 overleden in Nederland 1.758 mensen door zelfdoding. Daarvan waren 1.205 man en 553 vrouw. Na standaardisering ging het om 13,4 zelfdodingen per 100.000 mannen tegenover 6,1 per 100.000 vrouwen. Onder mensen jonger dan dertig is zelfdoding bovendien de belangrijkste doodsoorzaak, hoewel het relatieve cijfer bij oudere leeftijdsgroepen hoger kan liggen.",

        "Deze cijfers bewijzen niet dat mannen als groep door de geestelijke gezondheidszorg worden genegeerd. Zij bewijzen ook niet één oorzaak. Zelfdoding kent geen eenvoudige verklaring. Juist daarom is het relevant om te onderzoeken welke informatie vóór het overlijden beschikbaar was en voor wie.",

        "Een commercieel platform kan duizenden kleine gedragingen registreren zonder dat iemand ooit expliciet vraagt om geobserveerd te worden. Een werkgever kan uren, productiviteit en aanwezigheid registreren. Een financiële instelling kan betalingsgedrag verwerken. Maar psychische nood wordt institutioneel vaak pas bruikbaar als informatie wanneer de persoon of zijn omgeving erin slaagt die nood herkenbaar te maken als hulpvraag.",

        "Daar ontstaat een harde informatie-asymmetrie. De wereld kan heel veel weten over wat iemand koopt, waar hij werkt, wat hij aanklikt en of hij financieel kredietwaardig is, terwijl niemand noodzakelijk weet wat dezelfde persoon om drie uur ’s nachts denkt.",

        "Onderzoek van 113 Zelfmoordpreventie naar jongvolwassenen laat bovendien zien dat jonge mannen met suïcidale gedachten soms minder goed hun weg vinden naar informele steun en professionele hulp en dat overlijdens voor de omgeving soms onverwacht lijken te komen. Dat moet niet worden gereduceerd tot het cliché dat mannen gewoon niet willen praten. De onderzoeksvraag moet juist worden omgekeerd: hoeveel van de toegang tot hulp is afhankelijk gemaakt van precies die gedragingen die voor iemand in crisis moeilijk kunnen zijn?",

        "Wanneer iemand uiteindelijk overlijdt, is er geen gebrek meer aan classificatie. De doodsoorzaak wordt geregistreerd. Het probleem is dat registratie na de dood niet hetzelfde is als herkenning vóór de dood."
      ],
    },

    {
      id: "de-instelling-die-jou-nodig-heeft",
      eyebrow: "Institutionele asymmetrie",
      title: "Wanneer een systeem jou nodig heeft, wordt jouw twijfel een probleem dat het systeem probeert op te lossen.",
      intro:
        "De richting waarin behoefte loopt bepaalt hoeveel moeite een instelling doet om een mens te bereiken.",
      paragraphs: [
        "Defensie biedt hiervoor een uitzonderlijk helder voorbeeld omdat de organisatie zelf beschrijft hoe zij haar personeelsprobleem probeert op te lossen. De krijgsmacht moet groeien. Wanneer geïnteresseerde jongeren vervolgens niet solliciteren, wordt onderzocht waarom zij niet instromen.",

        "Defensie meldde in 2025 dat onderzoek liet zien dat geïnteresseerde jongeren onder andere twijfelden aan zichzelf op fysiek, mentaal en sociaal gebied. Vervolgens werd communicatie ontwikkeld om twijfelaars over de streep te trekken. De campagne werd verspreid via onder andere televisie, stations, Instagram, Snapchat, Reddit en YouTube.",

        "Daarmee wordt twijfel niet behandeld als een onveranderlijke eigenschap van het individu. Twijfel wordt een frictie in de instroomroute. De organisatie heeft een belang bij toetreding en probeert daarom die frictie te begrijpen en te verminderen.",

        "Dit is op zichzelf geen bewijs van misbruik. Een organisatie mag personeel zoeken. Maar de vergelijking met hulpverlening legt een fundamenteler verschil bloot. Wanneer de instelling capaciteit van jou nodig heeft, beschikt zij over een reden om jou te zoeken, je twijfel te onderzoeken, haar boodschap aan te passen en toetreding eenvoudiger te maken. Wanneer jij bescherming of hulp van een instelling nodig hebt, moet een groter gedeelte van die informatieroute vaak door jouzelf worden afgelegd.",

        "De abstracte tegenstelling wordt daardoor: capaciteit wordt actief gezocht; kwetsbaarheid moet zich vaker actief bekendmaken.",

        "Juist een jonge man die cultureel heeft geleerd dat zelfstandigheid, uithoudingsvermogen of emotionele beheersing waardevol zijn, kan daardoor in een merkwaardige positie terechtkomen. Dezelfde eigenschappen die hem langdurig functioneel maken kunnen de overgang naar hulp vertragen wanneer functioneren begint te breken."
      ],
    },

    {
      id: "mannelijkheid",
      eyebrow: "Van functie naar identiteit",
      title: "De gevaarlijkste selectie gebeurt wanneer de functie in het hoofd van de persoon verder leeft.",
      intro:
        "Een systeem hoeft uiteindelijk niet meer te zeggen wat iemand moet zijn wanneer iemand zichzelf langs dezelfde maatstaf begint te beoordelen.",
      paragraphs: [
        "Hardheid is niet noodzakelijk slecht. Emotionele beheersing kan noodzakelijk zijn tijdens gevaar. Risicobereidheid kan nodig zijn in noodsituaties. Lange uren werken kan tijdelijk rationeel zijn. Zelfredzaamheid kan vrijheid betekenen. Het probleem ontstaat wanneer een eigenschap die in één context nuttig is verandert in een algemene definitie van een goede man.",

        "Dan wordt gevaar verdragen moed. Lange uren maken verantwoordelijkheid. Niet afhankelijk zijn zelfstandigheid. Niet klagen kracht. De woorden zijn niet noodzakelijk leugens. Juist daarom zijn ze krachtig.",

        "Maar dezelfde norm reist mee naar situaties waarvoor zij nooit ontworpen was. Emotionele beheersing onder direct gevaar kan levens redden; emotionele afsluiting tijdens een psychische crisis kan communicatie blokkeren. Risico kunnen dragen kan professioneel noodzakelijk zijn; risico nodig hebben om eigenwaarde te ervaren is iets anders. Zelfstandigheid kan een vermogen zijn; hulp nodig hebben als bewijs van persoonlijke mislukking ervaren verandert dat vermogen in een gevangenis.",

        "Het systeem hoeft dit niet bewust te ontwerpen. Culturele normen kunnen ontstaan doordat dezelfde eigenschappen generaties lang op verschillende plaatsen worden beloond, bewonderd en opnieuw verteld.",

        "De meest pijnlijke overgang is daarom niet wanneer een werkgever zegt dat iemand productief moet zijn. Het is wanneer iemand zonder werkgever tegenover zichzelf staat en nog steeds denkt: zolang ik lever ben ik iets, en wanneer ik niet meer kan leveren blijft er niets over."
      ],
    },

    {
      id: "dader",
      eyebrow: "Een ongemakkelijke categorie",
      title: "Een man kan een dader zijn zonder dat zijn eerdere slachtofferschap ophoudt te hebben bestaan.",
      intro:
        "Morele verantwoordelijkheid en causale analyse beantwoorden verschillende vragen.",
      paragraphs: [
        "Dit onderdeel is belangrijk omdat onderzoek naar mannelijke slachtoffers anders heel gemakkelijk verandert in verontschuldiging van mannelijk geweld. Dat moet Meridian expliciet vermijden.",

        "Wanneer iemand geweld pleegt blijft hij verantwoordelijk voor zijn handelen binnen de grenzen die recht en bewijs daarvoor vaststellen. Maar verantwoordelijkheid beantwoordt niet automatisch de historische vraag hoe die persoon daar terechtkwam. Een strafbaar feit kan juridisch terecht als daad van een dader worden behandeld terwijl onderzoek naar jeugd, geweldservaringen, verslaving, uitsluiting, psychische problemen of sociale omgeving nog steeds noodzakelijk is om herhaling te begrijpen.",

        "Het omgekeerde probleem bestaat eveneens: wanneer iemand eenmaal slachtoffer is geweest, ontstaat daaruit geen vrijstelling van verantwoordelijkheid voor latere schade aan anderen.",

        "De volwassen analyse moet daarom twee proposities gelijktijdig kunnen dragen: iemand kan verantwoordelijk zijn voor wat hij een ander heeft aangedaan, en het kan tegelijkertijd waar zijn dat dezelfde persoon eerder ernstig beschadigd is.",

        "Wanneer de tweede waarheid wordt verwijderd omdat zij moreel ongemakkelijk is, verliezen we causale informatie. Wanneer de eerste waarheid wordt verwijderd omdat de persoon eerder slachtoffer was, verliezen we verantwoordelijkheid. Beide vormen zijn selectieve waarheid."
      ],
    },

    {
      id: "oorlog",
      eyebrow: "Mobilisatie",
      title: "In oorlog wordt het verschil tussen menselijke waarde en operationele waarde letterlijk.",
      intro:
        "Een krijgsmacht moet mensen reduceren tot functies om überhaupt te kunnen functioneren.",
      paragraphs: [
        "Op 1 maart 2026 telde Defensie volgens de cijfers in het onderliggende onderzoek 45.491 beroepsmilitairen, waarvan 39.507 man en 5.984 vrouw. Ook onder reservisten vormden mannen een grote meerderheid.",

        "Dit betekent niet dat Defensie uitsluitend mannen waardeert of uitsluitend mannen wil inzetten. De organisatie probeert juist meer vrouwen te werven en eisen functiegerichter te maken. Maar de huidige materiële samenstelling heeft een onvermijdelijk gevolg: wanneer militair gevaar werkelijkheid wordt, bevindt een groot gedeelte van de directe menselijke risicodragers zich binnen een sterk mannelijke populatie.",

        "Daarmee ontstaat een ongemakkelijk verschil tussen symbolische gelijkheid en materiële verdeling. Een samenleving kan terecht streven naar gelijke toegang tot militaire functies terwijl het bestaande risico in een crisis nog jarenlang ongelijk over lichamen verdeeld blijft doordat populaties veel langzamer veranderen dan beleid.",

        "Militaire communicatie moet bovendien een enorme geopolitieke werkelijkheid reduceren tot menselijke handelingsbereidheid. Verdragen, dreigingsbeelden, technologie, geschiedenis, territorium en strategische onzekerheid moeten uiteindelijk begrijpelijk worden als: iets moet beschermd worden, daarvoor zijn mensen nodig en jij zou één van die mensen kunnen zijn.",

        "Die vertaalslag kan feitelijk correcte informatie bevatten en tegelijkertijd mobiliserend zijn. Het belangrijke journalistieke onderscheid is daarom niet waarheid tegenover propaganda, maar beschrijving tegenover communicatie die tevens een operationeel doel heeft.",

        "De hardste vraag volgt pas daarna: wanneer een samenleving iemand vraagt zijn lichaam beschikbaar te stellen voor haar voortbestaan, hoeveel verantwoordelijkheid neemt diezelfde samenleving voor dat lichaam wanneer de functie voorbij is?"
      ],
    },

    {
      id: "markt",
      eyebrow: "Commerciële selectie",
      title: "Een markt hoeft je pijn niet veroorzaakt te hebben om eraan te kunnen verdienen.",
      intro:
        "Menselijke onzekerheid kan economisch materiaal worden zonder dat er één architect achter hoeft te bestaan.",
      paragraphs: [
        "Eenzaamheid hoeft niet door een datingplatform veroorzaakt te zijn voordat premiumfuncties eraan kunnen worden verkocht. Onzekerheid over uiterlijk hoeft niet door een fitnessbedrijf te zijn veroorzaakt voordat een product zich als oplossing kan aanbieden. Financiële angst hoeft niet door een handelsplatform veroorzaakt te zijn voordat financiële vrijheid marketingtaal wordt. Competitiedrang hoeft niet door een gokbedrijf te zijn uitgevonden voordat een weddenschap dezelfde spanning omzet in een transactie.",

        "Dat onderscheid is essentieel. Anders wordt ieder commercieel verband ten onrechte een complottheorie over gecreëerde behoeften. Het werkelijke mechanisme kan eenvoudiger en daardoor juist krachtiger zijn: bestaande menselijke spanning wordt opgespoord omdat aansluiting erop economisch rendement oplevert.",

        "Digitale systemen versnellen dat proces omdat zij niet noodzakelijk eerst een theorie over jonge mannen hoeven te hebben. Gedrag kan rechtstreeks worden gebruikt om waarschijnlijkheden te schatten. Wie ergens langer naar kijkt, terugkeert, zoekt, koopt of interacteert produceert informatie waarmee de volgende selectie preciezer kan worden.",

        "Daarmee ontstaat een paradoxale vorm van kennis. Een platform hoeft nauwelijks te weten wie iemand als mens is om uitstekend te kunnen voorspellen welke stimulus een reactie waarschijnlijker maakt.",

        "De moderne consument kan daardoor tegelijkertijd psychologisch onbegrepen en commercieel zeer goed leesbaar zijn."
      ],
    },

    {
      id: "gokken",
      eyebrow: "Casus",
      title: "Bij gokken komen sport, mannelijkheid, competitie, geld en schaamte in één infrastructuur terecht.",
      intro:
        "Niet omdat één van deze elementen automatisch het andere veroorzaakt, maar omdat verschillende systemen op dezelfde menselijke behoefte kunnen aansluiten.",
      paragraphs: [
        "In de tweede helft van 2025 waren jongvolwassenen van 18 tot 24 volgens de Kansspelautoriteit verantwoordelijk voor 22 procent van de gebruikte accounts bij legale online aanbieders terwijl zij 9,3 procent van de volwassen bevolking vormden. Hun gemiddelde verlies per gebruikt account lag lager dan dat van oudere spelers, maar zij speelden relatief vaker op sportweddenschappen.",

        "Andere Nederlandse onderzoeken waarnaar in het brondossier wordt verwezen laten zien dat gokken onder delen van jonge mannelijke voetbalfans relatief sterk genormaliseerd is en dat schaamte over verlies communicatie daarover kan beperken.",

        "De analytische waarde zit niet in de conclusie dat voetbal gokken veroorzaakt. De relevante keten is subtieler: sport bevat al competitie, voorspelling, groepsidentiteit, status en spanning; weddenschappen maken het vervolgens mogelijk dezelfde wedstrijd tegelijkertijd als financieel product te beleven.",

        "Wanneer verlies daarna wordt verbonden aan schaamte, ontstaat de merkwaardige mogelijkheid dat het commerciële systeem iemand uitstekend weet te bereiken op het moment dat hij wil spelen terwijl zijn sociale omgeving veel minder informatie ontvangt wanneer het misgaat.",

        "Precies die asymmetrie verbindt deze casus aan het bredere onderzoek."
      ],
    },

    {
      id: "geen-concurrentie",
      eyebrow: "Onderzoeksgrens",
      title: "Mannelijk slachtofferschap wordt niet serieuzer wanneer vrouwelijk slachtofferschap kleiner wordt gemaakt.",
      intro:
        "Als het onderzoek daarvoor nodig heeft dat het leed van anderen wordt ontkend, is het onderzoek mislukt.",
      paragraphs: [
        "De constatering dat mannen sterk oververtegenwoordigd zijn bij zelfdoding bewijst niets tegen vrouwelijke psychische problemen. De constatering dat mannen vaker ernstige arbeidsongevallen meemaken ontkent geen arbeidsongelijkheid die vrouwen raakt. De constatering dat veel militair risico bij mannen terechtkomt ontkent geen seksisme binnen militaire organisaties. En het erkennen van discriminatie tegen andere groepen maakt mannelijk slachtofferschap niet statistisch onmogelijk.",

        "Juist een dossier over selectieve waarheidsvinding moet weigeren dezelfde fout in omgekeerde richting te maken.",

        "Maatschappelijke werkelijkheid is geen boekhouding waarin aandacht voor het ene slachtoffer automatisch van het andere moet worden afgetrokken. Wanneer twee groepen door verschillende mechanismen worden beschadigd, is de wetenschappelijke reactie niet kiezen welk verhaal moreel aantrekkelijker is. De reactie is beide mechanismen reconstrueren.",

        "Daarom is de centrale aanklacht van dit onderzoek niet tegen vrouwen, feminisme, mannen, overheid, kapitalisme of één politieke richting. Zij is gericht tegen iedere informatiearchitectuur waarin de mens eerst in een bruikbare morele categorie moet passen voordat zijn werkelijkheid volledig onderzocht mag worden."
      ],
    },

    {
      id: "slot",
      eyebrow: "Conclusie",
      title: "Misschien zien we mannen niet te weinig. Misschien zien we te vaak alleen wat ze nog voor een systeem betekenen.",
      intro:
        "Het verschil tussen een bruikbare man en een volledige mens lijkt klein totdat bruikbaarheid verdwijnt.",
      paragraphs: [
        "De gegevens in dit dossier leveren geen bewijs voor één verborgen systeem dat mannen doelbewust opoffert. Zo’n conclusie zou verder gaan dan de beschikbare informatie. Wat de gegevens wel laten zien is dat verschillende instituties mannen relatief vaak aantreffen in posities waarin arbeid, lichamelijk risico, operationele capaciteit, competitie en zelfredzaamheid een belangrijke rol spelen.",

        "Tegelijkertijd bestaan meetbare uitkomsten waarin mannen zwaar vertegenwoordigd zijn, waaronder ernstige arbeidsongevallen en zelfdoding. De wetenschappelijke opdracht is daarom niet deze gegevens om te zetten in een nieuwe slachtofferidentiteit, maar te onderzoeken welke verbindingen aantoonbaar bestaan tussen selectie, functie, norm, risico, hulp en uitval.",

        "Misschien ligt een deel van het probleem niet in een samenleving die zegt dat mannen niets waard zijn. Misschien ligt het juist in een samenleving die bepaalde mannelijke capaciteiten zo normaal vindt dat pas bij het verdwijnen ervan zichtbaar wordt hoeveel van de persoon eraan vast was komen te zitten.",

        "Een sterke werknemer krijgt loon. Een inzetbare militair krijgt een functie. Een aantrekkelijke consument krijgt aanbiedingen. Een competitieve gebruiker krijgt nieuwe prikkels. Een zelfstandige man krijgt ruimte om zelfstandig te blijven.",

        "Maar wie vindt hem wanneer hij niets koopt, niets produceert, niets verdedigt, niets presteert, niets vraagt en alleen nog probeert de volgende dag te bereiken?",

        "Dat is geen antwoord.",

        "Dat is de vraag waarmee dit onderzoek begint."
      ],
    },
  ],
},
];

export function getResearchBySlug(slug: string) {
  return research.find((item) => item.slug === slug);
}

export function getFeaturedResearch() {
  return research.find((item) => item.featured);
}
