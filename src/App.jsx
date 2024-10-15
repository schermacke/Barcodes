import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BarcodeReader = () => {
  const [badgeData, setBadgeData] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [file, setFile] = useState(null);

  // Função para capturar o código de barras "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && barcode.trim() !== "") {
      const badgeNumber = barcode.trim();
      // Adiciona o número do crachá à lista
      setBadgeData((prevData) => [...prevData, { number: badgeNumber }]);
      setBarcode("");
    }
  };

  // Função para lidar com a seleção do arquivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Atualiza badgeData com os dados existentes do arquivo
        setBadgeData(jsonData);
        setFile(selectedFile);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const saveToExcel = () => {
    const existingData = XLSX.utils.json_to_sheet(badgeData);
    const newData = XLSX.utils.json_to_sheet([{ number: barcode }]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, existingData, "Crachas");
    XLSX.utils.book_append_sheet(workbook, newData, "Novos Crachas");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, file ? file.name : "crachas.xlsx");
  };

  return (
    <div style={{ paddingTop: "5rem" }}>
      <h1>Leitor de Código de Barras</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "15%",
        }}
      >
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      </div>
      <div style={{display:"flex", gap:'20px'}}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escaneie o código de barras"
        />
        <button onClick={saveToExcel} disabled={badgeData.length === 0}>
          Salvar no Excel
        </button>
      </div>
      {badgeData.length > 0 && (
        <table border="1" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Número do Crachá</th>
            </tr>
          </thead>
          <tbody>
            {badgeData.map((badge, index) => (
              <tr key={index}>
                <td>{badge.number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BarcodeReader;
