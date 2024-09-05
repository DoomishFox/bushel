import React, { type ChangeEvent, useLayoutEffect, useEffect, useRef, useState } from "react"
import type { Cell } from "#database/nbformat.ts"


export const Block = (props: {
    index: number,
    cell: Cell,
    onUpdate: (newCell: Cell) => void,
    onRemove: () => void,
    onAddBelow: (type: string) => void,
}) => {
    // auto-size textbox
    // TODO: figure out why its not working when adding new cells
    const textbox = useRef<HTMLTextAreaElement | null>(null);
    const adjustHeight = () => {
        if (textbox.current) {
            textbox.current.style.height = "inherit";
            textbox.current.style.height = `${textbox.current.scrollHeight}px`;
        }
    }
    useLayoutEffect(() => adjustHeight(), [textbox]);

    const setProperty = (name: string, value: string) => {
        if (name == "source") { adjustHeight() }
        notifyUpdateCell({...props.cell, [name]: value})
    }

    const notifyUpdateCell = (cell: Cell) => { props.onUpdate(cell) }
    
    const notifyDelCell = () => { props.onRemove() }

    const notifyAddCell = (type: string) => { props.onAddBelow(type) }

    return (
        <div style={{ marginTop: "0.5rem" }}>
            <div style={{ border: "1px solid lightgrey", borderRadius: "3px", padding: "1rem" }}>

                <div style={{ display: "flex" }}>
                    <label htmlFor={`type-dropdown-${props.index}`}>type: </label>
                    <select
                        id={`type-dropdown-${props.index}`}
                        name="cell_type"
                        value={props.cell.cell_type}
                        onChange={e => setProperty(e.target.name, e.target.value)}
                    >
                        <option value="markdown">markdown</option>
                        <option value="code">code</option>
                        <option value="raw">raw</option>
                    </select>
                    <span style={{ width: "auto", flex: "1" }}></span>
                    <button onClick={notifyDelCell}>delete</button>
                </div>
                <div>
                    <textarea style={{ width: "100%", resize: "vertical", height: "inherit" }}
                        ref={textbox}
                        name="source"
                        value={Array.isArray(props.cell.source) ? props.cell.source.join("") : props.cell.source}
                        onChange={e => {setProperty(e.target.name, e.target.value)}}
                    />
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "-0.75rem" }}>
                <div>
                    <button
                        name="code"
                        onClick={e => notifyAddCell((e.target as HTMLButtonElement).name)}
                    >+ code</button>
                    <button
                        name="markdown"
                        onClick={e => notifyAddCell((e.target as HTMLButtonElement).name)}
                    >+ markdown</button>
                </div>
            </div>
        </div>
    )
}