export const emailTemplate = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Willkommen bei Home Finder!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        color: #333;
      }
      .email-container {
        background-color: #fff;
        max-width: 600px;
        margin: auto;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 20px;
      }
      .cover-image {
        width: 50%;
        height: auto;
      }
      h1 {
        color: #3dafac;
        text-align: center;
        margin-bottom: 10px;
      }
      .intro {
        font-size: 16px;
        text-align: center;
        margin: 20px 0;
        line-height: 1.5;
      }
      .keywords {
        text-align: center;
        margin: 20px 0;
      }
      .keyword-bubble {
        display: inline-block;
        background-color: #bdc841;
        color: #fff;
        padding: 8px 15px;
        border-radius: 20px;
        margin: 5px;
        font-size: 14px;
        font-weight: bold;
        animation: bubble 1.5s ease-in-out infinite;
      }
      @keyframes bubble {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
      .login-section {
  background-color: #f9f9f9;
  border-left: 5px solid #bdc841;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  text-align: center;
}

.login-section h2 {
  color: #3dafac;
  font-size: 22px;
  margin-bottom: 15px;
}

.login-item {
  background-color: #fff;
  border: 2px solid #bdc841;
  border-radius: 10px;
  padding: 10px 15px;
  margin: 10px auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 400px;
}

.login-item p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.login-item span {
  font-weight: bold;
  color: #3dafac;
}

.copy-button {
  background-color: #3dafac;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.copy-button:hover {
  background-color: #35a59d;
}

.info-text {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}
.secret-tips {
  background-color: #fff;
  border: 2px solid #3dafac;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.secret-tips h2 {
  color: #3dafac;
  font-size: 20px;
  margin-bottom: 15px;
  text-align: center;
}

.secret-tips ul {
  list-style: none;
  padding: 0;
}

.secret-tips ul li {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.secret-tips ul li::before {
  content: "✨";
  color: #bdc841;
  font-size: 18px;
  margin-right: 10px;
}

    
      .button {
        display: block;
        width: 100%;
        max-width: 200px;
        text-align: center;
        margin: 20px auto;
        padding: 10px;
        background-color: #3dafac;
        color: #fff;
        border-radius: 5px;
        text-decoration: none;
        font-size: 16px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .title {
        text-align: center;
        font-size: 24px;
        color: #3dafac;
        margin-bottom: 20px;
      }
      .provider {
        display: flex;
        align-items: center;
        background-color: #f9f9f9;
        margin-bottom: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .provider img {
        width: 120px;
        height: 120px;
        object-fit: cover;
      }
      .provider-info {
        flex-grow: 1;
        padding: 15px;
      }
      .provider-info h3 {
        margin: 0;
        color: #3dafac;
        font-size: 18px;
      }
      .provider-info p {
        margin: 10px 0;
        font-size: 14px;
        line-height: 1.5;
      }
      .provider-info a {
        display: inline-block;
        margin-top: 10px;
        color: #bdc841;
        text-decoration: none;
        font-weight: bold;
      }
      .provider-info a:hover {
        text-decoration: underline;
      }

      /* FAQ Styling */
      .faq {
  background-color: #f9f9f9;
  border: 2px solid #3dafac;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.faq h2 {
  color: #3dafac;
  font-size: 22px;
  text-align: center;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.faq-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.faq-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.faq-item p {
  margin: 0 0 5px;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.faq-item p strong {
  color: #3dafac;
  font-size: 18px;
}

.faq-item a {
  color: #bdc841;
  text-decoration: none;
  font-weight: bold;
}

.faq-item a:hover {
  text-decoration: underline;
}

/* Checklist Styling */
.checklist {
  background-color: #fff;
  border: 2px solid #bdc841;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.checklist h2 {
  color: #3dafac;
  font-size: 20px;
  margin-bottom: 15px;
}
.checklist ul {
  list-style: none;
  padding: 0;
}
.checklist li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}
.checklist input[type="checkbox"] {
  margin-right: 10px;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid #bdc841;
  cursor: pointer;
}
.checklist input[type="checkbox"]:checked {
  background-color: #bdc841;
  border-color: #bdc841;
}
.search-info {
  background-color: #f9f9f9;
  border-left: 5px solid #3dafac;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  text-align: center;
}
.search-info h2 {
  color: #3dafac;
  font-size: 22px;
  margin-bottom: 10px;
}
.search-info p {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 20px;
}
.search-info a {
  color: #3dafac;
  text-decoration: none;
  font-weight: bold;
}
.search-info a:hover {
  text-decoration: underline;
}
.search-info .button {
  display: inline-block;
  background-color: #3dafac;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}
.search-info .button:hover {
  background-color: #35a59d;
}


.email-header {
  position: relative;
  text-align: center;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 20px;
}

.header-image {
  width: 100%;
  height: auto;
}

.header-logo {
  width: 40%; /* Breite des Logos */
  height: auto;
  border-radius: 16px;
  border: 4px solid #7d0381;
  animation: pulse 2s infinite, slide-in 2s ease-in-out;
}


/* Pulsierende Animation */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(125, 3, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(125, 3, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(125, 3, 129, 0);
  }
}

.header-title {
  font-size: 24px;
  color: #7d0381;
}
.first-listing {
  background-color: #f9f9f9;
  border-left: 5px solid #bdc841;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  text-align: center;
}

.first-listing h2 {
  color: #3dafac;
  font-size: 22px;
  margin-bottom: 10px;
}

.first-listing p {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 20px;
}

.listing-container {
  background-color: #fff;
  border: 2px solid #bdc841;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
  text-align: left;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.first-listing a.button {
  display: inline-block;
  background-color: #3dafac;
  color: #fff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.first-listing a.button:hover {
  background-color: #35a59d;
}
.email-footer {
  background-color: #f9f9f9;
  border-top: 5px solid #bdc841;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  text-align: center;
}

.footer-content {
  max-width: 600px;
  margin: auto;
}

.footer-logo {
  width: 80px;
  margin-bottom: 10px;
}

.email-footer h2 {
  color: #3dafac;
  font-size: 22px;
  margin-bottom: 15px;
}

.email-footer p {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
}

.email-footer ul {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.email-footer ul li {
  font-size: 16px;
  color: #666;
  margin: 10px 0;
}

.footer-links {
  margin-top: 20px;
  font-size: 14px;
  color: #333;
}

.footer-links a {
  color: #3dafac;
  text-decoration: none;
  font-weight: bold;
  margin: 0 5px;
}

.footer-links a:hover {
  text-decoration: underline;
}
.header-subtitle {
  font-size: 20px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
  font-style: italic;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Cover Image -->
      <div class="email-header">
        <!-- <img
          src="https://guruhub-ai.com/modern_home.webp"
          alt="Modern Home"
          class="header-image"
        /> -->
        <img
          src="https://guruhub-ai.com/Home%20Guru.png"
          alt="Home Finder Logo"
          class="header-logo"
        />
      </div>
      <h1 class="header-title">Willkommen bei Home Finder 🏡</h1>
      <h2 class="header-subtitle">Dein neues Zuhause wartet auf dich! - Alles ist bereit</h2>
      <p class="intro">
        Alles ist gut, wir
        finden jetzt das Traumzuhause – wir stehen dir zur Seite, um dein neues
        Zuhause zu finden. Mit unseren bewährten Strategien, hilfreichen Tipps
        und einer Auswahl der besten Anbieter machen wir die Wohnungssuche
        einfach und sorgenfrei. Gemeinsam schaffen wir das – Schritt für Schritt
        zu deinem Traumzuhause. ✨
      </p>
      <!-- Login Details -->
      <div class="login-section">
        <h2>🔑 Deine Login-Daten:</h2>
        <div class="login-item">
          <p>
            <strong>E-Mail:</strong> <span>{{username}}</span>
          </p>
        </div>
        <div class="login-item">
          <p>
            <strong>Passwort:</strong> <span>{{password}}</span>
          </p>
        </div>
        <p class="info-text">
          Bewahre deine Login-Daten sicher auf. Bei Fragen kannst du dich jederzeit an
          unseren Support wenden. 😊
        </p>
      </div>
      <div class="first-listing">
        <h2>✨ Dein erstes Inserat ist bereit!</h2>
        <p>
          Basierend auf deinem Prompt haben wir bereits ein erstes Inserat für dich verfasst.
          Du kannst es jetzt überprüfen und bei Bedarf anpassen:
        </p>
        <div class="listing-container">
          {{inserat}}
        </div>
        <p>
          <strong>Hinweis:</strong> Ein gutes Inserat ist der Schlüssel zu deinem Traumzuhause. Mach es einzigartig! 🏡
        </p>
      </div>
      <div class="search-info">
        <h2>🏡 Dein Traumzuhause ist näher als du denkst!</h2>
        <p>
          Basierend auf deinen Angaben haben wir bereits passende Angebote für dich gesucht. 
          Du findest sie jetzt in deinem <a href="/profil">Profil</a>. ✨
        </p>
        <p>
          Melde dich an und entdecke Wohnungen, die perfekt zu dir passen. Wir arbeiten weiterhin daran, dir die besten Ergebnisse zu liefern!
        </p>
        <a href="/profil" class="button">Zu meinem Profil</a>
      </div>
      <div class="checklist">
        <h2>📝 Perfekte Checkliste für deine Wohnungssuche:</h2>
        <ul>
          <li>
            <label>
              <input type="checkbox" />
              💰 <strong>Budget festlegen:</strong> Überlege dir, wie viel Miete du zahlen kannst, inkl. Nebenkosten und Kaution.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🏡 <strong>Suchkriterien definieren:</strong> Zimmeranzahl, Lage, Balkon, Stellplatz, Haustiere erlaubt?
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              📄 <strong>Alle Unterlagen vorbereiten:</strong> Schufa-Auskunft, Gehaltsnachweise, Mietschuldenfreiheitsbescheinigung, etc.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🌐 <strong>Realistische Plattformen nutzen:</strong> Suche auf ImmobilienScout24, Immowelt, Immonet oder eBay Kleinanzeigen.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🗓️ <strong>Zeit für Besichtigungen einplanen:</strong> Plane mehrere Termine und sei pünktlich.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🔍 <strong>Kritisch prüfen bei Besichtigungen:</strong> Zustand von Wohnung, Lage und Gemeinschaftsflächen prüfen.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🗂️ <strong>Überzeugende Bewerbungsmappe erstellen:</strong> Personalisiertes Anschreiben und relevante Unterlagen bereithalten.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              📞 <strong>Kommunikation mit Vermietern optimieren:</strong> Sei höflich und stelle gezielte Fragen zu Vertrag und Nebenkosten.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              📝 <strong>Mietvertrag genau prüfen:</strong> Lies den Vertrag gründlich und kläre offene Punkte.
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" />
              🛠️ <strong>Backup-Strategien vorbereiten:</strong> Suche nach Übergangslösungen oder anderen Stadtteilen, falls nötig.
            </label>
          </li>
        </ul>
      </div>
      <!-- Secret Tips -->
      <div class="secret-tips">
        <h2>🌟 Secret Tipps:</h2>
        <ul>
          <li>Nutze Emojis, damit fällt dein Inserat auf. 😊</li>
          <li>Strukturiere dein Inserat mit klaren Absätzen – es wirkt übersichtlich.</li>
          <li>Füge hinzu, dass du versichert bist – das schafft Vertrauen. 🛡️</li>
          <li>Erstelle eine eigene Anzeige mit deinem Bild – am besten direkt vor Ort.</li>
          <li>Erwähne einen Finderlohn, um potenzielle Helfer zu motivieren. 💰</li>
          <li>Beschreibe genau, welche Eigenschaften dir bei der Wohnung wichtig sind.</li>
          <li>Sei höflich und freundlich in deinem Inserat – das hinterlässt einen guten Eindruck. 😊</li>
          <li>Nutze lokale Facebook-Gruppen oder Kleinanzeigen-Plattformen zusätzlich.</li>
          <li>Frage dein Netzwerk – viele Wohnungen werden nicht öffentlich angeboten. 🤝</li>
          <li>Schreibe, dass du langfristig mietest – das spricht Vermieter an.</li>
        </ul>
      </div>
      

      <div class="secret-tips">
        <h2>Die größten Anbieter in Deutschland:</h2>
      </div>
 <div class="secret-tips">
      <div class="provider ">
        <img src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png" alt="Immowelt" />
        <div class="provider-info">
          <h3>Immowelt</h3>
          <p>
            Bietet aktuelle Immobilien, Wohnungen und Häuser zur Miete oder zum
            Kauf in ganz Deutschland.
          </p>
          <a href="https://www.immowelt.de/" target="_blank">Zum Anbieter</a>
        </div>
      </div>
      <div class="provider">
        <img src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png" alt="Immonet" />
        <div class="provider-info">
          <h3>Immonet</h3>
          <p>
            Ein weiteres großes Portal für Immobilien, Wohnungen und Häuser zur
            Miete oder zum Kauf.
          </p>
          <a href="https://www.immonet.de/" target="_blank">Zum Anbieter</a>
        </div>
      </div>
      <div class="provider">
        <img src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png" alt="Wohnungsbörse.net" />
        <div class="provider-info">
          <h3>Wohnungsbörse.net</h3>
          <p>
            Kostenlose Plattform für die Suche nach WG-Zimmern, günstigen
            Mietwohnungen und Kaufimmobilien.
          </p>
          <a href="https://www.wohnungsboerse.net/" target="_blank"
            >Zum Anbieter</a
          >
        </div>
      </div>
      <div class="provider">
        <img src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png" alt="Immobilo" />
        <div class="provider-info">
          <h3>Immobilo</h3>
          <p>
            Aggregiert Angebote aus verschiedenen Immobilienportalen und
            Kleinanzeigenseiten.
          </p>
          <a href="https://www.immobilo.de/" target="_blank">Zum Anbieter</a>
        </div>
      </div>
      <div class="provider">
        <img src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png" alt="Nestpick" />
        <div class="provider-info">
          <h3>Nestpick</h3>
          <p>
            Online-Plattform für möblierte Wohnungen und Zimmer zur
            mittelfristigen Miete, insbesondere für Expats und Studierende.
          </p>
          <a href="https://www.nestpick.com/" target="_blank">Zum Anbieter</a>
        </div>
      </div>
      <div class="provider">
        <img
          src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png"
          alt="eBay Kleinanzeigen"
        />
        <div class="provider-info">
          <h3>eBay Kleinanzeigen</h3>
          <p>
            Bietet eine Vielzahl von Immobilienanzeigen von Privatpersonen und
            Maklern.
          </p>
          <a href="https://www.ebay-kleinanzeigen.de/" target="_blank"
            >Zum Anbieter</a
          >
        </div>
      </div>
      </div>
      <div class="faq">
        <h2>❓ Häufig gestellte Fragen</h2>
        <div class="faq-item">
          <p><strong>Wie viele Anbieter kann ich kontaktieren?</strong></p>
          <p>Du kannst so viele Inserate wie nötig kontaktieren.</p>
        </div>
        <div class="faq-item">
          <p><strong>Kostet die Nutzung von Home Finder etwas?</strong></p>
          <p>Die Nutzung des Basic Packets ist für dich komplett kostenlos. Für die anderen Packet finden wir einen passendend Preis für dich</p>
        </div>
        <div class="faq-item">
          <p><strong>Wie kann ich den Support kontaktieren?</strong></p>
          <p>Schreibe uns jederzeit an <a href="mailto:support@homefinder.com">support@homefinder.com</a>.</p>
        </div>
      </div>
      <div class="email-footer">
        <div class="footer-content">
          <img
            src="https://guruhub-ai.com/assets/homefinderguru-C4ywgNqh.png"
            alt="HomeFinder Logo"
            class="footer-logo"
          />
          <h2>Wir sind für dich da! 🏡</h2>
          <p>
            Ab jetzt kann es losgehen – wir geben unser Bestes, damit du dein neues Zuhause findest. Mit
            unserer Unterstützung wird die Wohnungssuche einfacher und stressfrei.
          </p>
          <ul>
            <li>🔍 Wir durchsuchen die besten Plattformen für dich.</li>
            <li>📄 Wir helfen dir mit Tipps für ein perfektes Inserat.</li>
            <li>✨ Wir sind immer erreichbar, wenn du Fragen hast.</li>
          </ul>
          <p>
            Dein Traumzuhause ist unser Ziel. Wir stehen dir auf jedem Schritt zur Seite. 💪
          </p>
          <div class="footer-links">
            <a href="/datenschutz" target="_blank">Datenschutz</a> | 
            <a href="/impressum" target="_blank">Impressum</a>
          </div>
        </div>
      </div>
      

  </body>
</html>

`;
