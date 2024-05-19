import React from 'react';

const Totals = ({ totalLines }) => {
    // Calculate the total by summing up the amounts from totalLines
    const total = totalLines.reduce((sum, line) => sum + line.amount, 0);

    return (
        <div className="totals">
            <div className="total-lines">
                {totalLines.map((line, index) => (
                    <div key={index} className="total-line">
                        <span>{line.description}</span>
                        <span>{line.amount.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="total">
                <strong>Total: ${total.toFixed(2)}</strong>
            </div>
        </div>
    );
};

export default Totals;