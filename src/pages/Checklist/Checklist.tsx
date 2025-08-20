import React, { useState, useEffect } from "react";
import "./Checklist.css";

const Checklist: React.FC = () => {
  const defaultItems = [
    { id: 1, text: "💰 Budget festlegen: Überlege dir, wie viel Miete du zahlen kannst, inkl. Nebenkosten und Kaution." , checked: false },
    { id: 2, text: "🏡 Suchkriterien definieren: Zimmeranzahl, Lage, Balkon, Stellplatz, Haustiere erlaubt?" , checked: false },
    { id: 3, text: "📄 Alle Unterlagen vorbereiten: Schufa-Auskunft, Gehaltsnachweise, Mietschuldenfreiheitsbescheinigung, etc." , checked: false },
    { id: 4, text: "🌐 Realistische Plattformen nutzen: Suche auf ImmobilienScout24, Immowelt, Immonet oder eBay Kleinanzeigen." , checked: false },
    { id: 5, text: "🗓️ Zeit für Besichtigungen einplanen: Plane mehrere Termine und sei pünktlich." , checked: false },
    { id: 6, text: "🔍 Kritisch prüfen bei Besichtigungen: Zustand von Wohnung, Lage und Gemeinschaftsflächen prüfen." , checked: false },
    { id: 7, text: "🗂️ Überzeugende Bewerbungsmappe erstellen: Personalisiertes Anschreiben und relevante Unterlagen bereithalten." , checked: false },
    { id: 8, text: "📞 Kommunikation mit Vermietern optimieren: Sei höflich und stelle gezielte Fragen zu Vertrag und Nebenkosten." , checked: false },
    { id: 9, text: "📝 Mietvertrag genau prüfen: Lies den Vertrag gründlich und kläre offene Punkte." , checked: false },
    { id: 10, text: "🛠️ Backup-Strategien vorbereiten: Suche nach Übergangslösungen oder anderen Stadtteilen, falls nötig." , checked: false },
];

  const [checklistItems, setChecklistItems] = useState(() => {
    try {
      const saved = localStorage.getItem("checklist");
      return saved ? JSON.parse(saved) : defaultItems;
    } catch {
      return defaultItems;
    }
  });

  const [newItem, setNewItem] = useState("");

  const handleCheckboxChange = (id: number) => {
    const updatedItems = checklistItems.map((item: any) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklistItems(updatedItems);
    localStorage.setItem("checklist", JSON.stringify(updatedItems));
  };

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newItem.trim() !== "") {
      const newItemObj = {
        id: checklistItems.length + 1,
        text: newItem,
        checked: false,
      };
      const updatedItems = [...checklistItems, newItemObj];
      setChecklistItems(updatedItems);
      setNewItem("");
      localStorage.setItem("checklist", JSON.stringify(updatedItems));
    }
  };

  return (
    <div className="checklist">
      <h2>📝 Perfekte Checkliste für deine Wohnungssuche:</h2>
      <ul>
        {Array.isArray(checklistItems) &&
          checklistItems.map((item: any) => (
            <li key={item.id} className={item.checked ? "checked" : ""}>
              <div className="checklist-item">
                <input
                  type="checkbox"
                  checked={item.checked || false}
                  onChange={() => handleCheckboxChange(item.id)}
                />
                <span>{item.text}</span>
              </div>
            </li>
          ))}
      </ul>
      <input
        type="text"
        placeholder="Neuen Eintrag hinzufügen..."
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        onKeyDown={handleAddItem}
        className="new-item-input"
      />
    </div>
  );
  
};

export default Checklist;
