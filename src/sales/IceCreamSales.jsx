import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";

const IceCreamSales = () => {
  const [parsedData, setParsedData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlySales, setMonthlySales] = useState({});
  const [popularItems, setPopularItems] = useState({});
  const [revenueItems, setRevenueItems] = useState({});
  const [itemOrderStats, setItemOrderStats] = useState({});

  useEffect(() => {
    fetch("/salesData.json")
      .then((response) => response.json())
      .then((data) => {
        setParsedData(data);

        const monthlySalesData = {};
        const monthlyQuantity = {};
        const monthlyRevenue = {};
        const itemStats = {};

        let totalSalesAmount = 0;

        data.forEach(({ Date, SKU, Quantity, TotalPrice }) => {
          const month = Date.slice(0, 7);

          // 1. Accumulate total sales
          totalSalesAmount += TotalPrice;

          // 2. Month-wise sales totals
          monthlySalesData[month] = (monthlySalesData[month] || 0) + TotalPrice;

          // 3. Track most popular item (quantity) and most revenue-generating item
          if (!monthlyQuantity[month]) monthlyQuantity[month] = {};
          if (!monthlyRevenue[month]) monthlyRevenue[month] = {};

          monthlyQuantity[month][SKU] =
            (monthlyQuantity[month][SKU] || 0) + Quantity;
          monthlyRevenue[month][SKU] =
            (monthlyRevenue[month][SKU] || 0) + TotalPrice;

          // 4. Stats for most popular item
          if (!itemStats[SKU]) itemStats[SKU] = [];
          itemStats[SKU].push(Quantity);
        });

        setTotalSales(totalSalesAmount);

        // Find most popular and revenue-generating items for each month
        const findMax = (obj) =>
          Object.entries(obj).reduce((a, b) => (b[1] > a[1] ? b : a));

        const popularItemsByMonth = {};
        const revenueItemsByMonth = {};

        Object.keys(monthlyQuantity).forEach((month) => {
          const [item, quantity] = findMax(monthlyQuantity[month]);
          popularItemsByMonth[month] = { item, quantity };
        });

        Object.keys(monthlyRevenue).forEach((month) => {
          const [item] = findMax(monthlyRevenue[month]);
          revenueItemsByMonth[month] = item;
        });

        // Compute min, max, and average orders for popular items
        const itemOrderStatistics = {};
        Object.keys(itemStats).forEach((item) => {
          const orders = itemStats[item];
          const min = Math.min(...orders);
          const max = Math.max(...orders);
          const avg = orders.reduce((a, b) => a + b, 0) / orders.length;
          itemOrderStatistics[item] = { min, max, avg };
        });

        setMonthlySales(monthlySalesData);
        setPopularItems(popularItemsByMonth);
        setRevenueItems(revenueItemsByMonth);
        setItemOrderStats(itemOrderStatistics);
      });
  }, []);

  return (
    <div className="main-container">
      <h1>Ice Cream Parlour Sales Analysis</h1>
      <p>
        <strong>Total Sales: </strong> {totalSales}
      </p>

      <h2>Month-wise Sales</h2>
      <ul>
        {Object.entries(monthlySales).map(([month, sales]) => (
          <li key={month}>
            {month}: {sales}
          </li>
        ))}
      </ul>

      <h2>Most Popular Items by Month</h2>
      <ul>
        {Object.entries(popularItems).map(([month, { item, quantity }]) => (
          <li key={month}>
            {month}: {item} (Quantity Sold: {quantity})
          </li>
        ))}
      </ul>

      <h2>Items Generating Most Revenue by Month</h2>
      <ul>
        {Object.entries(revenueItems).map(([month, item]) => (
          <li key={month}>
            {month}: {item}
          </li>
        ))}
      </ul>
      <h2>Order Stats for Popular Items</h2>
      <div className="table-container">
        <Table bordered className="centered">
          <thead>
            <tr>
              <th>Item</th>
              <th>Min</th>
              <th>Max</th>
              <th>Avg</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemOrderStats).map(([item, stats]) => (
              <tr key={item}>
                <td>{item}</td>
                <td>{stats.min}</td>
                <td>{stats.max}</td>
                <td>{stats.avg.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default IceCreamSales;
