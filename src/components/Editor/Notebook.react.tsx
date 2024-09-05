import React, { useState, useRef, StrictMode } from "react"
import type { LeafDetails } from "#database/leaf.ts"
import type { Cell } from "#database/nbformat.ts"
import { Block } from "./Block.react"

// TODO: figure out why this is *sometimes* clipping the last character???
const splitInclusive = (data: string, char: string) => {
    let segments = []
    let prev_split = 0
    for (let i = 0; i <= data.length; i++) {
        if (data[i] == char) {
            segments.push(data.slice(prev_split, i + 1));
            prev_split = i + 1
        }
    }
    segments.push(data.slice(prev_split));
    return segments;
}

export const Notebook = (props: {
    metadata: LeafDetails,
    cells: Cell[],
}) => {
    const [meta, setMeta] = useState(props.metadata)
    const [cells, setCells] = useState(props.cells)

    const updateCellAt = (index: number, newCell: Cell) => {
        setCells(cells.map((cell, i) => i == index ? newCell : cell))
    }

    const removeCellAt = (index: number) => {
        setCells([
            ...cells.slice(0, index),
            ...cells.slice(index + 1)
        ])
    }

    const insertCellAt = (index: number, type: string) => {
        const newCell: Cell = { cell_type: type, id: `abcd${(Math.random() * 100).toFixed(0)}`, metadata: {}, source: "" }
        setCells([
            ...cells.slice(0, index),
            newCell,
            ...cells.slice(index)
        ])
    }

    const handleSaveClick = () => {
        console.log(meta)
        const formattedCells = cells.map<Cell>(cell => (
            {
                ...cell,
                source: Array.isArray(cell.source)
                    ? cell.source
                    : splitInclusive(cell.source, "\n")
            }
        ))
        alert(JSON.stringify(formattedCells))
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button >close</button>
                <div>
                    <input
                        type="text"
                        name="path"
                        placeholder={meta.path}
                        value={meta.path}
                        onChange={e => setMeta({...meta, [e.target.name]: e.target.value})}
                    />
                    <input 
                        type="text"
                        name="id"
                        placeholder={meta.id}
                        value={meta.id}
                        onChange={e => setMeta({...meta, [e.target.name]: e.target.value})}
                    />
                </div>
                <button onClick={handleSaveClick}>Save</button>
            </div>
            <div style={{ display: "flex", justifyContent: "stretch", marginTop: "3rem" }}>
                <input style={{ width: "100%", fontSize: "16pt" }}
                    type="text"
                    name="title"
                    placeholder={meta.title}
                    value={meta.title}
                    onChange={e => setMeta({...meta, [e.target.name]: e.target.value})}
                />
            </div>
            <div style={{ marginTop: "1rem" }}>
                {/* <StrictMode> */}
                {cells.map((cell, index) => (
                    <Block
                        key={index + "-" + cell.id} index={index}
                        cell={cell}
                        onUpdate={(newCell) => updateCellAt(index, newCell)}
                        onRemove={() => removeCellAt(index)}
                        onAddBelow={(type) => insertCellAt(index + 1, type)}
                    />
                ))}
                {/* </StrictMode> */}
            </div>
        </div>
    )
}