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
  const [amount, setAmount] = useState<number | "">("");
  const [term, setTerm] = useState<number | "">("");  
  const [result, setResult] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    annual_rate: "" as number | "",
    min_amount: "" as number | "",
    max_amount: "" as number | "",
    min_term: "" as number | "",
    max_term: "" as number | "",
  });
  

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleSimulate = async () => {
    if (!selected || typeof amount !== "number" || amount <= 0 || typeof term !== "number" || term <= 0) {
      toast.error("Completa todos los campos correctamente para simular.");
      return;
    }
  
    if (!Number.isInteger(amount)) {
      toast.error("El monto no debe tener decimales. Usá números sin puntos.");
      return;
    }
  
    if (!Number.isInteger(term)) {
      toast.error("El plazo no debe tener decimales. Usá números sin puntos.");
      return;
    }
  
    const selectedProduct = products.find(p => p.name === selected);
    if (!selectedProduct) {
      toast.error("Producto seleccionado no encontrado.");
      return;
    }
  
    if (amount < selectedProduct.min_amount || amount > selectedProduct.max_amount) {
      toast.error(
        `Monto fuera de rango. Debe estar entre ${selectedProduct.min_amount} y ${selectedProduct.max_amount}.`
      );
      return;
    }
  
    if (term < selectedProduct.min_term || term > selectedProduct.max_term) {
      toast.error(
        `Plazo fuera de rango. Debe estar entre ${selectedProduct.min_term} y ${selectedProduct.max_term} meses.`
      );
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
      ([, val]) => val === "" || val === null 
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
        annual_rate: "",
        min_amount: "",
        max_amount: "",
        min_term: "",
        max_term: "",
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
