export const housingRequestEmailTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ihr Wohnungsgesuch wurde erfolgreich erstellt</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e9ecef;
        }
        .card {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .credentials {
            background: #e8f4f8;
            padding: 20px;
            border-left: 4px solid #007bff;
            border-radius: 4px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background: #0056b3;
        }
        .housing-details {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .detail-row {
            display: flex;
            margin: 8px 0;
        }
        .detail-label {
            font-weight: bold;
            min-width: 120px;
            color: #495057;
        }
        .detail-value {
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 GuruHub Home Finder</h1>
        <h2>Ihr Wohnungsgesuch wurde erfolgreich erstellt!</h2>
    </div>
    
    <div class="content">
        <p>Hallo {{username}},</p>
        
        <p>großartig! Ihr Wohnungsgesuch wurde erfolgreich in unserem System erstellt und ist bereits für Vermieter sichtbar.</p>
        
        <div class="card">
            <h3>📋 Ihr Wohnungsgesuch</h3>
            <div class="housing-details">
                {{housingRequestDescription}}
            </div>
            
            {{#if filteredData}}
            <h4>🎯 Ihre Suchkriterien:</h4>
            <div class="housing-details">
                {{#if filteredData.budget}}
                <div class="detail-row">
                    <span class="detail-label">Budget:</span>
                    <span class="detail-value">bis {{filteredData.budget}}€</span>
                </div>
                {{/if}}
                {{#if filteredData.location}}
                <div class="detail-row">
                    <span class="detail-label">Standort:</span>
                    <span class="detail-value">{{filteredData.location}}</span>
                </div>
                {{/if}}
                {{#if filteredData.rooms}}
                <div class="detail-row">
                    <span class="detail-label">Zimmer:</span>
                    <span class="detail-value">{{filteredData.rooms}}</span>
                </div>
                {{/if}}
                {{#if filteredData.moveInDate}}
                <div class="detail-row">
                    <span class="detail-label">Einzug ab:</span>
                    <span class="detail-value">{{filteredData.moveInDate}}</span>
                </div>
                {{/if}}
            </div>
            {{/if}}
        </div>

        <div class="credentials">
            <h3>🔑 Ihre Zugangsdaten</h3>
            <p>Wir haben ein Konto für Sie erstellt, damit Sie Ihr Gesuch verwalten können:</p>
            <p><strong>E-Mail:</strong> {{username}}</p>
            <p><strong>Passwort:</strong> {{password}}</p>
            <p><em>Sie können Ihr Passwort nach dem ersten Login ändern.</em></p>
        </div>

        <div style="text-align: center;">
            <a href="{{loginLink}}" class="button">📱 Zum Dashboard</a>
            <a href="{{housingRequestLink}}" class="button">🏠 Gesuch anzeigen</a>
        </div>

        <div class="card">
            <h3>📈 Was passiert jetzt?</h3>
            <ul>
                <li>✅ Ihr Gesuch ist live und für Vermieter sichtbar</li>
                <li>🔍 Vermieter können Sie über unser intelligentes Suchsystem finden</li>
                <li>📧 Sie erhalten Benachrichtigungen bei Interesse</li>
                <li>✏️ Sie können Ihr Gesuch jederzeit bearbeiten</li>
            </ul>
        </div>

        <div class="card">
            <h3>💡 Tipps für mehr Erfolg</h3>
            <ul>
                <li>📸 Fügen Sie aussagekräftige Fotos hinzu</li>
                <li>📝 Beschreiben Sie sich und Ihre Situation</li>
                <li>⏰ Antworten Sie schnell auf Anfragen</li>
                <li>🤝 Seien Sie höflich und authentisch</li>
            </ul>
        </div>

        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
        
        <p>Viel Erfolg bei der Wohnungssuche!<br>
        Ihr GuruHub Team</p>
        
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
            GuruHub Home Finder | Diese E-Mail wurde automatisch generiert.<br>
            Falls Sie diese E-Mail nicht erwartet haben, ignorieren Sie sie bitte.
        </p>
    </div>
</body>
</html>
`;