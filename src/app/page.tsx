"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  simulateLoan,
} from "@/services/loanService";
import { toast } from "react-toastify";
import styles from "./page.module.css";
import NewProductDialog from "@/app/newProduct";


export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState(0);
  const [term, setTerm] = useState(0);
  const [result, setResult] = useState<any>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    annual_rate: 0,
    min_amount: 0,
    max_amount: 0,
    min_term: 0,
    max_term: 0,
  });

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleSimulate = async () => {
    if (!selected || amount <= 0 || term <= 0) {
      toast.error("Completa todos los campos correctamente para simular.");
      return;
    }

    try {
      const res = await simulateLoan({
        product_name: selected,
        amount,
        term,
      });

      if (res.detail) {
        toast.error(`Error: ${res.detail}`);
        return;
      }

      setResult(res);
      toast.success("Simulación exitosa ");
    } catch (err) {
      toast.error("Error al simular el préstamo. Verifica el servidor.");
      console.error(err);
    }
  };

  const handleSaveProduct = async () => {
    const camposIncompletos = Object.entries(newProduct).some(
      ([, val]) => val === "" || val === 0
    );

    if (camposIncompletos) {
      toast.error("Por favor, completa todos los campos del nuevo producto.");
      return;
    }

    try {
      await createProduct(newProduct);
      const updated = await getProducts();
      setProducts(updated);
      toast.success("Producto agregado correctamente ");

      setShowDialog(false);
      setNewProduct({
        name: "",
        annual_rate: 0,
        min_amount: 0,
        max_amount: 0,
        min_term: 0,
        max_term: 0,
      });
    } catch (error) {
      toast.error("Error al guardar el producto. Verifica el servidor.");
      console.error(error);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Simulador de Préstamos</h1>

      <label className={styles.label}>Tipo de préstamo:</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className={styles.input}
      >
        <option value="">Seleccione un producto</option>
        {products.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <label className={styles.label}>Monto del préstamo:</label>
      <input
        type="number"
        placeholder="Ej: 5000"
        className={styles.input}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <label className={styles.label}>Plazo en meses:</label>
      <input
        type="number"
        placeholder="Ej: 12"
        className={styles.input}
        value={term}
        onChange={(e) => setTerm(Number(e.target.value))}
      />

      <button onClick={handleSimulate} className={styles.buttonPrimary}>
        Simular
      </button>

      <button
        className={styles.buttonSecondary}
        onClick={() => setShowDialog(true)}
      >
        + Agregar nuevo producto
      </button>

      {result && (
        <div className={styles.resultBox}>
          <p>
            <strong>Cuota mensual:</strong> ${result.monthly_payment}
          </p>
          <p>
            <strong>Costo total:</strong> ${result.total_cost}
          </p>
        </div>
      )}

      {showDialog && (
        <NewProductDialog
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onClose={() => setShowDialog(false)}
          onSave={handleSaveProduct}
        />
      )}

    </main>
  );
}
