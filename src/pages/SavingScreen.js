import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CarouselComponent from '../components/CarouselComponent';
import ButtonComponent from '../components/ButtonComponent';
import DropdownItemsPerPageComponent from '../components/DropdownItemsPerPageComponent';
import SavingDataComponent from '../components/SavingDataComponent';
import { getSavings, deleteSaving, patchSaving } from '../services/saving';
import GraphComponent from '../components/GraphComponent';
import { subtractMonths } from '../utils/numbers';


const SavingScreen = () => {
    const [dataMonths, setDataMonths] = useState([]);
    const [itemsPerPages, setItemsPerPages] = useState(3);
    const [currentsMonths, setCurrentsMonths] = useState([]);

    const focusCurrentMonth = () => {
        const currentDate = new Date();
        const currentIndex = dataMonths.findIndex((month) => {
            const monthDate = new Date(month.date);
            return monthDate.getFullYear() === currentDate.getFullYear() && monthDate.getMonth() === currentDate.getMonth();
        });

        if (currentIndex !== -1) {
            setStartIndex(currentIndex - 1);
        }
    };

    const [startIndex, setStartIndex] = useState(focusCurrentMonth);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savings = await getSavings();
                setDataMonths(savings);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setCurrentsMonths(dataMonths.slice(startIndex, startIndex + itemsPerPages));
    }, [dataMonths, startIndex, itemsPerPages]);

    useEffect(() => {
        focusCurrentMonth();
    }, [dataMonths]);

    const handlePrev = () => {
        setStartIndex((prevIndex) => Math.max(prevIndex - itemsPerPages, 0));
    };

    const handleNext = () => {
        setStartIndex((prevIndex) => {
            const newIndex = prevIndex + itemsPerPages;
            return newIndex >= dataMonths.length ? Math.max(0, dataMonths.length - itemsPerPages) : newIndex;
        });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPages(newItemsPerPage);
        setStartIndex(0);
    };

    const handleDeleteSaving = async (id) => {
        const isConfirmed = window.confirm(`¿Quiere eliminar el ahorro completamente?`);

        if (isConfirmed) {
            try {
                await deleteSaving(id);
                setDataMonths((prevData) =>
                    prevData.map((month) => ({
                        ...month,
                        saving: month.saving.filter((item) => item.id !== id),
                    }))
                );
            } catch (error) {
                console.error('Error deleting saving:', error);
            }
        }
    };

    const handlePatchSaving = async (id, data, date) => {
        const body = { ...data, date_to: subtractMonths(date, 1) };
        const isConfirmed = window.confirm(`¿Quiere finalizar '${data.name}' a partir del ${date}?`);

        if (isConfirmed) {
            try {
                await patchSaving(id, body);
                const updatedData = await getSavings();
                setDataMonths(updatedData);
            } catch (error) {
                console.error('Error patching saving:', error);
            }
        }
    };

    return (
        <div className="dark bg-gray-900 min-h-screen py-4">
            <h1 className="text-center text-2xl font-bold text-white tracking-tight">Ahorros Invertidos</h1>
            <p className="italic text-center text-sm text-blue-200 mb-6">- Renta fija, pasiva y variable -</p>
            <div className="relative p-1">
                {/* Botón Agregar */}
                <div className="text-center">
                    <Link
                        className="text-white bg-gradient-to-br from-[#4b76c8] to-[#1f4691] rounded-[45px] text-[15px] p-[10px] border-4 border-[#252525] shadow-[ -6px_-5px_18px_rgba(255,255,255,0.1)] cursor-pointer"
                        to="/agregar"
                    >
                        + Agregar
                    </Link>
                </div>

                {/* Contenedor de botones y dropdown */}
                <div className="flex justify-center">
                    <div className="flex justify-between items-center mt-4 w-[48rem]">
                        {/* Botón Izquierdo */}
                        <ButtonComponent
                            text="⬅️"
                            onClick={handlePrev}
                            className="hover:bg-blue-500 text-2xl rounded-full px-3 py-1 flex-shrink-0"
                        />

                        {/* Botones Centrales */}
                        <div className="flex flex-grow justify-center items-center space-x-4 px-4">
                            <ButtonComponent
                                text="Ver actual"
                                onClick={focusCurrentMonth}
                                className="hover:bg-blue-500 bg-gray-600 px-3 border-gray-950 text-white"
                            />
                            <DropdownItemsPerPageComponent
                                itemsPerPage={itemsPerPages}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>

                        {/* Botón Derecho */}
                        <ButtonComponent
                            text="➡️"
                            onClick={handleNext}
                            className="hover:bg-blue-500 text-2xl rounded-full px-3 py-1 flex-shrink-0"
                        />
                    </div>
                </div>

                {/* Componente Carrusel */}
                <CarouselComponent
                    data={currentsMonths}
                    renderItem={(monthData) => (
                        <SavingDataComponent
                            monthData={monthData}
                            onDeleteSaving={handleDeleteSaving}
                            onPatchSaving={handlePatchSaving}
                        />
                    )}
                />
            </div>

            {/* Gráfico */}
            <div className="pt-10 text-center max-w-screen-sm mx-auto">
                <GraphComponent data={dataMonths} />
            </div>
        </div>
    );
};

export default SavingScreen;