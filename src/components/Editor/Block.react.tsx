import React, { type ChangeEvent } from "react"

export const Block = (props: {
    index: number,
    text: string,
    onContentChange: (newText: string) => void,
    remove: () => void,
    addBelow: (type: string) => void,
}) => {
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        props.onContentChange(event.target.value)
    }

    const handleRemoveBlock = () => {
        props.remove()
    }

    const handleAddBlock = () => {
        props.addBelow("markdown")
    }

    return (
        <div style={{ marginTop: "0.5rem" }}>
            <div style={{ border: "1px solid lightgrey", borderRadius: "3px", padding: "1rem"}}>
                
                <div style={{ display: "flex" }}>
                    <label htmlFor={`type-dropdown-${props.index}`}>type: </label>
                    <select name="type" id={`type-dropdown-${props.index}`}>
                        <option value="code">code</option>
                        <option value="markdown">markdown</option>
                    </select>
                    <span style={{ width: "auto", flex: "1" }}></span>
                    <button onClick={handleRemoveBlock}>delete</button>
                </div>
                <div>
                    <textarea style={{ width: "100%", resize: "vertical" }}
                        value={props.text}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "-0.75rem" }}>
                <div>
                    <button onClick={handleAddBlock} >+ code</button>
                    <button onClick={handleAddBlock} >+ markdown</button>
                </div>
            </div>
        </div>
    );
};