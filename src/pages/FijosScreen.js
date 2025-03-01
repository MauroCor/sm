import React, { useEffect, useState } from 'react';
import CarouselComponent from '../components/CarouselComponent';
import ButtonComponent from '../components/ButtonComponent';
import DropdownItemsPerPageComponent from '../components/DropdownItemsPerPageComponent';
import FixedDataComponent from '../components/FixedDataComponent';
import { getIncomes, patchIncome } from '../services/income';
import { getFixedCosts, patchFixedCost } from '../services/fixedCost';
import { adjustMonths } from '../utils/numbers';
import { parse, compareAsc } from 'date-fns';
import { getMonthlyData, handlePrev, handleNext, focusCurrentMonth } from '../utils/useMonthlyData';
import { useExchangeRate } from '../context/ExchangeRateContext';
import AddButtonComponent from '../components/AddButtonComponent';
import ExchangeRateDisplay from '../components/ExchangeRateDisplay';

const FijosScreen = () => {
  const { exchangeRate } = useExchangeRate();
  const [dataMonths, setDataMonths] = useState([]);
  const [itemsPerPages, setItemsPerPages] = useState(3);
  const [currentsMonths, setCurrentsMonths] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const mergeData = (incomes, fixedCosts) => {
    const allMonths = [
      ...new Set([
        ...incomes.map((income) => income.date),
        ...fixedCosts.map((fixedCost) => fixedCost.date),
      ]),
    ];

    const mergedData = allMonths.map((month) => {
      const matchingIncome = incomes.find((incomeMonth) => incomeMonth.date === month);
      const matchingFixedCost = fixedCosts.find((fixedCostMonth) => fixedCostMonth.date === month);

      const income = matchingIncome || { income: [], total: 0 };
      const fixedCost = matchingFixedCost || { fixedCost: [], total: 0 };

      return {
        date: month,
        income: { items: income.income, total: income.total },
        fixedCost: { items: fixedCost.fixedCost, total: fixedCost.total },
      };
    });

    const filteredData = mergedData.filter(
      (month) => month.income.items.length > 0 || month.fixedCost.items.length > 0
    );

    filteredData.sort((a, b) => compareAsc(parse(a.date, "yyyy-MM", new Date()), parse(b.date, "yyyy-MM", new Date())));

    return filteredData;
  };

  const fetchAndMergeData = async () => {
    setLoading(true);
    try {
      const [incomes, fixedCosts] = await Promise.all([
        getIncomes(`?exchg_rate=${exchangeRate}`),
        getFixedCosts(`?exchg_rate=${exchangeRate}`),
      ]);

      const mergedData = mergeData(incomes, fixedCosts);
      setDataMonths(mergedData);
      focusCurrentMonth(mergedData, setStartIndex);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndMergeData();
  }, [exchangeRate]);

  useEffect(() => {
    setCurrentsMonths(getMonthlyData(dataMonths, startIndex, itemsPerPages));
  }, [dataMonths, startIndex, itemsPerPages]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPages(newItemsPerPage);
    setStartIndex(0);
  };

  const handleDeleteFijos = async (data, monthName, type) => {
    const body = { ...data, date_to: adjustMonths(monthName, -1) };
    const isConfirmed = window.confirm(`¿Quiere eliminar '${data.name}' a partir de ${monthName}?`);

    if (isConfirmed) {
      try {
        const patchFunction = type === "fixedCost" ? patchFixedCost : patchIncome;
        await patchFunction(body);
        fetchAndMergeData();
      } catch (error) {
        console.error(`Error patching ${type}:`, error);
      }
    }
  };

  return (
    <div className="dark bg-gray-900 min-h-screen py-4">
      <h1 className="text-center text-2xl font-bold text-white tracking-tight">Balances Mensuales</h1>
      <p className="italic text-center text-sm text-blue-200 mb-6">- Ingresos y egresos fijos -</p>
      <div className="relative p-1">
        <div className="text-center">
          <AddButtonComponent fromScreen="Ingreso" />
        </div>

        <CarouselComponent
          data={currentsMonths}
          loading={loading}
          renderItem={(monthData) => (
            <FixedDataComponent
              monthData={monthData}
              onDeleteFijos={handleDeleteFijos}
            />
          )}
        >
          <div className="flex justify-center">
            <div className="flex justify-between items-center mt-4 w-[48rem]">
              <ButtonComponent
                text="⬅️"
                onClick={() => setStartIndex(handlePrev(startIndex, itemsPerPages))}
                className="hover:bg-blue-500 text-2xl rounded-full px-3 py-1 flex-shrink-0"
              />
              <div className="flex flex-grow justify-center items-center space-x-2">
                <ButtonComponent
                  text="Actual"
                  onClick={() => focusCurrentMonth(dataMonths, setStartIndex)}
                  className="hover:bg-blue-500 bg-gray-600 px-1 border-gray-950 text-white"
                />
                <DropdownItemsPerPageComponent
                  itemsPerPage={itemsPerPages}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
                <ExchangeRateDisplay />
              </div>
              <ButtonComponent
                text="➡️"
                onClick={() => setStartIndex(handleNext(startIndex, itemsPerPages, dataMonths.length))}
                className="hover:bg-blue-500 text-2xl rounded-full px-3 py-1 flex-shrink-0"
              />
            </div>
          </div>
        </CarouselComponent>
      </div>
    </div>
  );
};

export default FijosScreen;
