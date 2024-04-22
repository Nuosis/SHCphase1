import React from 'react';

export const Accordion = ({ headerText, name, children, id, openState }) => {
    return (
        <div id={id} className="collapse collapse-arrow bg-base-200">
            <input type="radio" name={name} defaultChecked={openState} className="peer" />
            <div className="collapse-title text-xl font-medium">
                {headerText}
            </div>
            <div className="collapse-content peer-checked:bg-base-100"> 
                {children}
            </div>
        </div>
    );
};
/**
 * Accordion works with checkbox inputs. You can control which item to be open by checking/unchecking the hidden checkbox input.
 * 
 * All checkbox inputs with the same name work together. 
 * If you have more than one set of accordion items on a page, use different names for the checkbox inputs on each set.
 * 
 */