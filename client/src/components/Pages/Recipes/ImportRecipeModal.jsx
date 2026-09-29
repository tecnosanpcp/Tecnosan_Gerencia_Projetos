import React, { useMemo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FiUpload, FiFileText, FiCheck, FiAlertCircle } from "react-icons/fi";
import ExcelJS from "exceljs";
import { useQueryClient } from "@tanstack/react-query";

import { createMaterial } from "@services/MaterialService.js";
import { createAccessory } from "@services/AccessoriesServices.js";

const MATERIAL_UNITS = [
  "t",
  "kg",
  "g",
  "Uni",
  "Caixa",
  "Milheiro",
  "L",
  "ml",
];

const IMPORT_TYPES = {
  materials: {
    label: "Materiais",
    queryKey: ["materials"],
    headers: ["Nome", "Descrição", "Valor", "Unidade"],
  },

  accessories: {
    label: "Acessórios",
    queryKey: ["accessories"],
    headers: ["Nome", "Nº de Série", "Valor", "Data da Compra"],
  },
};

const normalizeHeader = (value) => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/º/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .trim();
};

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }

  if (typeof value === "number") {
    return value;
  }

  let normalized = String(value).trim();

  normalized = normalized.replace(/[R$\s]/g, "");

  if (normalized.includes(",") && normalized.includes(".")) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");

    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : NaN;
};

const formatExcelDate = (value) => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(
      excelEpoch.getTime() + value * 24 * 60 * 60 * 1000
    );

    if (!Number.isNaN(date.getTime())) {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
  }

  const text = String(value).trim();

  if (!text) return "";

  // dd/mm/yyyy
  const brDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (brDate) {
    const [, day, month, year] = brDate;

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  // yyyy-mm-dd
  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (isoDate) {
    const [, year, month, day] = isoDate;

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const parsedDate = new Date(text);

  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
};

const getCellValue = (cell) => {
  if (!cell) return "";

  if (cell.type === ExcelJS.ValueType.RichText && Array.isArray(cell.value)) {
    return cell.value.map((item) => item.text || "").join("");
  }

  if (
    cell.type === ExcelJS.ValueType.Formula &&
    cell.result !== undefined
  ) {
    return cell.result;
  }

  return cell.value ?? "";
};

export default function ImportRecipeModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [importType, setImportType] = useState("materials");
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [fileError, setFileError] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const currentConfig = IMPORT_TYPES[importType];

  const hasRows = rows.length > 0;

  const canImport = useMemo(() => {
    return Boolean(file && rows.length > 0 && !importing);
  }, [file, rows, importing]);

  const resetModal = () => {
    setImportType("materials");
    setFile(null);
    setRows([]);
    setFileError("");
    setImporting(false);
    setProgress(0);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (importing) return;

    resetModal();
    onClose?.();
  };

  const validateHeaders = (headers) => {
    const normalizedHeaders = headers.map(normalizeHeader);
    const expectedHeaders = currentConfig.headers.map(normalizeHeader);

    if (normalizedHeaders.length < expectedHeaders.length) {
      return false;
    }

    return expectedHeaders.every(
      (header, index) => normalizedHeaders[index] === header
    );
  };

  const readWorkbook = async (selectedFile) => {
    const workbook = new ExcelJS.Workbook();

    const buffer = await selectedFile.arrayBuffer();

    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("A planilha não possui nenhuma aba.");
    }

    if (worksheet.rowCount < 2) {
      throw new Error(
        "A planilha precisa possuir pelo menos uma linha de dados."
      );
    }

    const headerRow = worksheet.getRow(1);

    const headers = [];

    for (let column = 1; column <= currentConfig.headers.length; column++) {
      headers.push(getCellValue(headerRow.getCell(column)));
    }

    if (!validateHeaders(headers)) {
      throw new Error(
        `Cabeçalho inválido. Para ${currentConfig.label}, utilize exatamente: ${currentConfig.headers.join(
          " | "
        )}`
      );
    }

    const parsedRows = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const values = [];

      for (let column = 1; column <= currentConfig.headers.length; column++) {
        values.push(getCellValue(row.getCell(column)));
      }

      const hasContent = values.some(
        (value) => normalizeText(value) !== ""
      );

      if (!hasContent) return;

      if (importType === "materials") {
        parsedRows.push({
          rowNumber,
          name: normalizeText(values[0]),
          description: normalizeText(values[1]),
          value: parseNumber(values[2]),
          unit: normalizeText(values[3]),
        });

        return;
      }

      parsedRows.push({
        rowNumber,
        name: normalizeText(values[0]),
        serialNumber: normalizeText(values[1]),
        value: parseNumber(values[2]),
        purchaseDate: formatExcelDate(values[3]),
      });
    });

    if (parsedRows.length === 0) {
      throw new Error("Nenhum dado foi encontrado na planilha.");
    }

    return parsedRows;
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    setFileError("");
    setResult(null);
    setRows([]);
    setProgress(0);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setFile(null);
      setFileError("Selecione um arquivo Excel (.xlsx ou .xls).");
      return;
    }

    try {
      setFile(selectedFile);

      const parsedRows = await readWorkbook(selectedFile);

      setRows(parsedRows);
    } catch (error) {
      console.error("Erro ao ler planilha:", error);

      setFile(null);
      setRows([]);
      setFileError(
        error?.message || "Não foi possível ler a planilha selecionada."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const validateMaterial = (item) => {
    if (!item.name) {
      return "Nome não informado.";
    }

    if (!item.description) {
      return "Descrição não informada.";
    }

    if (!Number.isFinite(item.value) || item.value <= 0) {
      return "Valor inválido.";
    }

    if (!item.unit) {
      return "Unidade não informada.";
    }

    const validUnit = MATERIAL_UNITS.some(
      (unit) => normalizeText(unit).toLowerCase() === item.unit.toLowerCase()
    );

    if (!validUnit) {
      return `Unidade inválida. Utilize: ${MATERIAL_UNITS.join(", ")}.`;
    }

    return null;
  };

  const validateAccessory = (item) => {
    if (!item.name) {
      return "Nome não informado.";
    }

    if (!Number.isFinite(item.value) || item.value <= 0) {
      return "Valor inválido.";
    }

    if (!item.purchaseDate) {
      return "Data da compra inválida ou não informada.";
    }

    return null;
  };

  const handleImport = async () => {
    if (!canImport) return;

    setImporting(true);
    setResult(null);
    setProgress(0);

    const errors = [];
    let successCount = 0;

    for (let index = 0; index < rows.length; index++) {
      const item = rows[index];

      try {
        const validationError =
          importType === "materials"
            ? validateMaterial(item)
            : validateAccessory(item);

        if (validationError) {
          errors.push({
            rowNumber: item.rowNumber,
            message: validationError,
          });

          setProgress(Math.round(((index + 1) / rows.length) * 100));
          continue;
        }

        if (importType === "materials") {
          const normalizedUnit =
            MATERIAL_UNITS.find(
              (unit) => unit.toLowerCase() === item.unit.toLowerCase()
            ) || item.unit;

          const response = await createMaterial(
            item.name,
            item.description,
            item.value,
            normalizedUnit
          );

          if (Array.isArray(response) && response.length === 0) {
            throw new Error("A API não confirmou a criação do material.");
          }
        } else {
          const response = await createAccessory(
            item.name,
            item.serialNumber,
            item.value,
            item.purchaseDate
          );

          if (!response) {
            throw new Error("A API não confirmou a criação do acessório.");
          }
        }

        successCount++;
      } catch (error) {
        console.error(
          `Erro ao importar linha ${item.rowNumber}:`,
          error
        );

        errors.push({
          rowNumber: item.rowNumber,
          message:
            error?.response?.data?.error ||
            error?.message ||
            "Erro desconhecido ao criar registro.",
        });
      }

      setProgress(Math.round(((index + 1) / rows.length) * 100));
    }

    await queryClient.invalidateQueries({
      queryKey: currentConfig.queryKey,
    });

    setImporting(false);

    setResult({
      successCount,
      errorCount: errors.length,
      errors,
    });
  };

  const handleSelectFile = () => {
    if (importing) return;

    fileInputRef.current?.click();
  };

  const handleTypeChange = (type) => {
    if (importing) return;

    setImportType(type);
    setFile(null);
    setRows([]);
    setFileError("");
    setResult(null);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#DFE1E6] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E6] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172B4D]">
              Importar dados
            </h2>

            <p className="mt-1 text-sm text-[#6B778C]">
              Importe vários registros diretamente de uma planilha Excel.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="rounded p-1 text-[#6B778C] transition hover:bg-[#F4F5F7] hover:text-[#172B4D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoMdClose size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Tipo */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-[#172B4D]">
              Tipo de importação
            </label>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(IMPORT_TYPES).map(([key, config]) => {
                const selected = importType === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeChange(key)}
                    disabled={importing}
                    className={`rounded-md border px-4 py-3 text-left transition ${
                      selected
                        ? "border-[#0052CC] bg-[#DEEBFF]"
                        : "border-[#DFE1E6] bg-white hover:bg-[#F4F5F7]"
                    } disabled:cursor-not-allowed`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        selected ? "text-[#0052CC]" : "text-[#172B4D]"
                      }`}
                    >
                      {config.label}
                    </div>

                    <div className="mt-1 text-xs text-[#6B778C]">
                      {config.headers.join(" | ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Padrão */}
          <div className="mb-5 rounded-md border border-[#DFE1E6] bg-[#F4F5F7] p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6B778C]">
              Formato esperado
            </div>

            <div className="font-mono text-sm text-[#172B4D]">
              {currentConfig.headers.join(" | ")}
            </div>
          </div>

          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleSelectFile}
            disabled={importing}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#B3BAC5] bg-white px-6 py-10 transition hover:border-[#0052CC] hover:bg-[#F4F5F7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiUpload size={28} className="mb-3 text-[#0052CC]" />

            <span className="text-sm font-semibold text-[#172B4D]">
              Clique para selecionar a planilha
            </span>

            <span className="mt-1 text-xs text-[#6B778C]">
              Arquivos Excel .xlsx ou .xls
            </span>
          </button>

          {/* Arquivo selecionado */}
          {file && !fileError && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-[#DFE1E6] bg-white p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-[#DEEBFF] text-[#0052CC]">
                <FiFileText size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#172B4D]">
                  {file.name}
                </div>

                <div className="text-xs text-[#6B778C]">
                  {rows.length}{" "}
                  {rows.length === 1 ? "registro encontrado" : "registros encontrados"}
                </div>
              </div>

              {hasRows && (
                <FiCheck
                  size={20}
                  className="shrink-0 text-[#00875A]"
                />
              )}
            </div>
          )}

          {/* Erro de leitura */}
          {fileError && (
            <div className="mt-4 flex gap-3 rounded-md border border-[#FFBDAD] bg-[#FFEBE6] p-3">
              <FiAlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-[#DE350B]"
              />

              <div>
                <div className="text-sm font-semibold text-[#BF2600]">
                  Não foi possível importar a planilha
                </div>

                <div className="mt-1 text-sm text-[#6B778C]">
                  {fileError}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {hasRows && !importing && !result && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-[#172B4D]">
                Pré-visualização
              </div>

              <div className="max-h-48 overflow-auto rounded-md border border-[#DFE1E6]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-[#F4F5F7]">
                    <tr>
                      <th className="border-b border-[#DFE1E6] px-3 py-2 text-xs font-semibold text-[#6B778C]">
                        Linha
                      </th>

                      {currentConfig.headers.map((header) => (
                        <th
                          key={header}
                          className="border-b border-[#DFE1E6] px-3 py-2 text-xs font-semibold text-[#6B778C]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.slice(0, 5).map((item) => (
                      <tr key={item.rowNumber}>
                        <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#6B778C]">
                          {item.rowNumber}
                        </td>

                        {importType === "materials" ? (
                          <>
                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.name}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.description}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {Number.isFinite(item.value)
                                ? `R$ ${item.value.toFixed(2)}`
                                : "-"}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.unit}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.name}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.serialNumber || "-"}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {Number.isFinite(item.value)
                                ? `R$ ${item.value.toFixed(2)}`
                                : "-"}
                            </td>

                            <td className="border-b border-[#DFE1E6] px-3 py-2 text-xs text-[#172B4D]">
                              {item.purchaseDate || "-"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length > 5 && (
                <div className="mt-2 text-xs text-[#6B778C]">
                  Mostrando as primeiras 5 linhas de {rows.length}.
                </div>
              )}
            </div>
          )}

          {/* Progresso */}
          {importing && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#172B4D]">
                  Importando...
                </span>

                <span className="text-sm text-[#6B778C]">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#DFE1E6]">
                <div
                  className="h-full bg-[#0052CC] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[#ABF5D1] bg-[#E3FCEF] p-4">
                  <div className="text-xs font-semibold uppercase text-[#006644]">
                    Importados
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-[#006644]">
                    {result.successCount}
                  </div>
                </div>

                <div
                  className={`rounded-md border p-4 ${
                    result.errorCount > 0
                      ? "border-[#FFBDAD] bg-[#FFEBE6]"
                      : "border-[#DFE1E6] bg-[#F4F5F7]"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold uppercase ${
                      result.errorCount > 0
                        ? "text-[#BF2600]"
                        : "text-[#6B778C]"
                    }`}
                  >
                    Com erro
                  </div>

                  <div
                    className={`mt-1 text-2xl font-semibold ${
                      result.errorCount > 0
                        ? "text-[#BF2600]"
                        : "text-[#172B4D]"
                    }`}
                  >
                    {result.errorCount}
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-[#172B4D]">
                    Linhas com erro
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-md border border-[#DFE1E6]">
                    {result.errors.map((error, index) => (
                      <div
                        key={`${error.rowNumber}-${index}`}
                        className="flex gap-3 border-b border-[#DFE1E6] p-3 last:border-b-0"
                      >
                        <div className="shrink-0 text-xs font-semibold text-[#DE350B]">
                          Linha {error.rowNumber}
                        </div>

                        <div className="text-xs text-[#6B778C]">
                          {error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errorCount === 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-[#ABF5D1] bg-[#E3FCEF] p-3 text-sm text-[#006644]">
                  <FiCheck size={18} />
                  Todos os registros foram importados com sucesso.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#DFE1E6] bg-white px-5 py-4">
          <div className="text-xs text-[#6B778C]">
            {rows.length > 0 && !result
              ? `${rows.length} registros prontos para importação`
              : result
              ? "Importação finalizada"
              : "Selecione uma planilha para continuar"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={importing}
              className="rounded-md border border-[#DFE1E6] bg-white px-4 py-2 text-sm font-medium text-[#172B4D] transition hover:bg-[#F4F5F7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {result ? "Fechar" : "Cancelar"}
            </button>

            {!result && (
              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport}
                className="rounded-md bg-[#0052CC] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0747A6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? "Importando..." : "Importar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}