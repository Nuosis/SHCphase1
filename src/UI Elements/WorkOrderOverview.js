import React from 'react';

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function generateStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function generateTaskList(tasks) {
    if (tasks.length > 0) {
        return (
            <ul className="list-disc pl-5">
                {tasks.map((task, index) => (
                    <li key={index} className="text-gray-700">{task}</li>
                ))}
            </ul>
        );
    } else {
        return <p className="text-gray-500">(No tasks)</p>;
    }
}

export default function WorkOrderOverview({ workOrderData }) {
    return (
        <div className="flex-grow">
            <p className="text-lg mb-2">
                <span className="font-bold text-primary dark:text-gray-400">Cleaner: </span>
                {workOrderData.cleaner}
            </p>
            <p className="text-lg mb-2">
                <span className="font-bold text-primary dark:text-gray-400">Date: </span>
                {formatDate(workOrderData.cleaningDate)}
                </p>
            <p className="text-lg mb-4">
                <span className="font-bold text-primary dark:text-gray-400">Invoice Number: </span>
                {workOrderData.invoiceNo}
            </p>
            <hr className="my-4" />
            <h3 className="text-xl text-primary font-semibold mb-2">Services & Charges:</h3>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="text-left py-2 px-4 bg-gray-100 font-semibold text-gray-700">Description</th>
                        <th className="text-right py-2 px-4 bg-gray-100 font-semibold text-gray-700">Amount ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {workOrderData.lineTotals.map((line, index) => (
                        <tr key={index} className="border-t">
                            <td className="py-2 px-4 text-gray-700">{line.description}</td>
                            <td className="py-2 px-4 text-right text-gray-700">{line.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    <tr className="border-t">
                        <td className="py-2 px-4 font-semibold text-gray-700">Total Price</td>
                        <td className="py-2 px-4 text-right font-semibold text-gray-700">{workOrderData.price.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <hr className="my-4" />
            <h3 className="text-xl text-primary font-semibold mb-2">Tasks Completed:</h3>
            <p className="text-lg font-semibold">High Priority:</p>
            {generateTaskList(workOrderData.tasks.highPriority)}
            <p className="text-lg font-semibold mt-2">Low Priority:</p>
            {generateTaskList(workOrderData.tasks.lowPriority)}
        </div>
    );
}