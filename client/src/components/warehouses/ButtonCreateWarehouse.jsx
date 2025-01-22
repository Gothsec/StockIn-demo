// Propósito: Nos permite crear una Bodega nueva
import { useContext } from "react";
import supabase from "../../utils/supabase";
import { ConfirmationDataContext } from "../../contexts/ConfirmationData";

export default function ButtonCreateWarehouse({
  newWarehouse,
  onClose,
  onUpdate,
}) {
  const { showNotification } = useContext(ConfirmationDataContext);

  const validateWarehouse = async () => {
    // Verificar si los campos necesarios están llenos
    if (
      !newWarehouse.name ||
      !newWarehouse.address ||
      !newWarehouse.responsible ||
      !newWarehouse.phone_number
    ) {
      showNotification("Todos los campos son requeridos.", "error");
      return false;
    }

    // Validar que el número de teléfono sea un valor válido
    if (!/^\d{10}$/.test(newWarehouse.phone_number)) { // Ejemplo de validación para un número de 10 dígitos
      showNotification("El número de teléfono debe tener 10 dígitos.", "error");
      return false;
    }

    // Validar que el nombre de la bodega sea único (sin considerar mayúsculas/minúsculas)
    const { data: existingWarehouses, error } = await supabase
      .from("warehouse")
      .select("name")
      .eq("state", true);

    if (error) {
      console.error("Error al verificar nombres de bodega: ", error);
      return false;
    }

    const lowerCaseName = newWarehouse.name.toLowerCase();
    const isNameTaken = existingWarehouses.some(
      (warehouse) => warehouse.name.toLowerCase() === lowerCaseName
    );

    if (isNameTaken) {
      showNotification("El nombre de la bodega ya existe.", "error");
      return false;
    }

    return true;
  };

  const handleCreateWarehouse = async () => {
    // Validamos los datos antes de enviarlos a la base de datos
    if (!(await validateWarehouse())) return;

    try {
      const { error } = await supabase
        .from("warehouse")
        .insert([newWarehouse])
        .single();

      if (error) {
        console.error("Error al crear la bodega: ", error);
        showNotification("Error al crear la bodega", "error");
      } else {
        showNotification("La bodega fue creada correctamente", "success");
        onClose(); // Cerramos el modal
        onUpdate(); // Actualizamos el listado o la vista donde se necesita
      }
    } catch (error) {
      console.error("Error al crear la bodega: ", error);
      showNotification("Hubo un error al crear la bodega", "error");
    }
  };

  return (
    <button
      className="bg-blue-500 text-white py-1 px-3 rounded-md"
      onClick={handleCreateWarehouse}
    >
      Crear
    </button>
  );
}
