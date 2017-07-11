# Realtime Web - Twitter App
Nooroel Imamdi - 500706701

De applicatie: [live demo](https://trendingtopics-realtime-web.herokuapp.com/).

## Concept
De gebruiker kan op basis van een selectie uit vier landen zien wat per land de trending topics zijn op Twitter. Vervolgens kan een specifieke topic gekozen worden, waarna de gebruiker de daar bijhorende tweets realtime binnen ziet komen. De gebruiker heeft altijd de mogelijkheid om van topic te veranderen.

## Data life cycle
1. De gebruiker selecteert een land.
2. Via de **server** wordt er een request uitgevoerd naar Twitter op basis van het geselecteerde land.
```
client.get('trends/place', {id: woeid}, function() {});
```

3. Zes topics worden in de **client** getoond en gepushed naar een array. Dat ziet er al volgt uit:
```
[
	{
		name: '#Trump',
		numberOfTweets: 0
	},
	{
		name: 'Londen',
		numberOfTweets: 0
	},
	...
]
```

4. De gebruiker selecteert een topic.
5. Op de **server** worden nieuwe tweets nagetrokken van de zojuist geselecteerde topics, door middel van een stream.
```
client.stream('statuses/filter', {track: socket.trackString}, function(stream) {});
```
6. Indien er een nieuwe Tweet binnen komt, dan wordt object van de topic waar de Tweet toebehoort geüpdate.


## Features
- Connection **server** en **client** via sockets, met `socket.io`
- Ontvang tweets van meerdere trending topics
- Gebruiker ontvangt melding als er een fout optreedt op de stream met twitter
- Gebruiker ontvangt melding als de verbinding tussen client en server mislukt
- Data op de **server** en **client** zijn hetzelfde (eveneens met tunnel events)
- Gebruiker kan tussendoor nog van topic-veranderen.

## Wishlist
- OAuth inloggen met Twitter-optie om limieten uit de weg te gaan
- Code naar modules refactoren

## Installatie

1. Clone repo
```
git clone https://github.com/nooroel-imamdi/real-time-web-twitter-her
cd real-time-web-twitter-her
```

2. Installeer dependencies
```
npm install
```

3. Maak een .env-file om de API call te kunnen doen
```
CONSUMER_KEY=CONSUMER_KEY
CONSUMER_SECRET=CONSUMER_SECRET
ACCESS_TOKEN=ACCESS_TOKEN
ACCESS_TOKEN_SECRET=ACCESS_TOKEN_SECRET
```

4. Start server
```
npm start
```

## Events

### Server
- `connection` - Zet alle andere events op de verbonden socket.
- `country` - Ontvangt land en `woeid` om trending topics te krijgen.
- `trendingtopics` - Verstuurt verzamelde topics naar de client.
- `set streams` - Plaats streams met twitter om de tweets van de trending topics te verzamelen
- `new tweet` - Stuurt de geupdatet data naar de client
- `error on stream` - In geval van een error wordt dit doorgegeven aan de client.


### Client
- `trending topics` - Haal de trending topics van de server
- `new tweet` - Update de gegevens met de nieuwe gegevens van de server
- `error on stream` - Toon foutmelding aan gebruiker
- `choose country` - Verzend geselecteerd land naar server
- `start streams` - Stream voor tweets wordt opgezet
- `disconnect` - Gebruiker krijgt error-melding te zien
- `reconnect` - Verberg de connection error


## Tooling
- [Socket](https://socket.io/)
- [Express](https://expressjs.com/)
- [EJS](www.embeddedjs.com/)
- [Twitter API](https://dev.twitter.com/)
- [Template literals](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Template_literals)
