"use client";

import styles from "@/app/page.module.css";

type Props = {
  newProduct: {
    name: string;
    annual_rate: number;
    min_amount: number;
    max_amount: number;
    min_term: number;
    max_term: number;
  };
  setNewProduct: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSave: () => void;
};

const fieldLabels: Record<string, string> = {
  name: "Nombre del producto",
  annual_rate: "Tasa efectiva anual (%)",
  min_amount: "Monto mínimo",
  max_amount: "Monto máximo",
  min_term: "Plazo mínimo (meses)",
  max_term: "Plazo máximo (meses)",
};

export default function NewProductDialog({
  newProduct,
  setNewProduct,
  onClose,
  onSave,
}: Props) {
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogBox}>
        <h2 className={styles.dialogTitle}>Nuevo producto de préstamo</h2>

        {Object.entries(newProduct).map(([key, val]) => (
          <div key={key} className={styles.dialogField}>
            <label className={styles.label}>{fieldLabels[key]}:</label>
            <input
              type={typeof val === "number" ? "number" : "text"}
              className={styles.input}
              value={newProduct[key as keyof typeof newProduct]}
              onChange={(e) =>
                setNewProduct((prev: any) => ({
                  ...prev,
                  [key]:
                    typeof val === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                }))
              }
            />
          </div>
        ))}

        <div className={styles.dialogActions}>
          <button className={styles.buttonCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.buttonPrimary} onClick={onSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
