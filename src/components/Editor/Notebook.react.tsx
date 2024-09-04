import React, { useState } from "react"
import type { LeafDetails } from "#database/leaf.ts";
import { Block } from "./Block.react"

export const Notebook = (props: {
    metadata: LeafDetails,
    paragraphs: string[],
}) => {
    const [meta, setMeta] = useState(props.metadata)
    const [title, setTitle] = useState(meta.title)
    const [paragraphs, setParagraphs] = useState(props.paragraphs)

    const handleBlockChange = (index: number, newText: string) => {
        const updatedParagraphs = [...paragraphs]
        updatedParagraphs[index] = newText
        setParagraphs(updatedParagraphs)
    }

    const removeBlockAt = (index: number) => {
        const updatedParagraphs = [...paragraphs]
        updatedParagraphs.splice(index, 1)
        setParagraphs(updatedParagraphs)
    }

    const insertBlockAt = (index: number, type: string) => {
        const updatedParagraphs = [...paragraphs]
        updatedParagraphs.splice(index + 1, 0, "")
        setParagraphs(updatedParagraphs)
    }

    const handleSaveClick = () => {
        console.log(meta)
        alert(paragraphs)
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
                {paragraphs.map((text, index) => (
                    <Block
                        key={index} index={index} // i hate that i have to do this
                        text={text}
                        onContentChange={(newText) => handleBlockChange(index, newText)}
                        remove={() => removeBlockAt(index)}
                        addBelow={(type) => insertBlockAt(index, type)}
                    />
                ))}
            </div>
        </div>
    );
};