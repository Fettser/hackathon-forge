import React, { forwardRef, useImperativeHandle, useRef, FocusEvent } from "react"

import './Member.css'

function validateValue(el: HTMLInputElement | null, regex?: RegExp) {
    if (!regex || !el) {
        return true
    }
    if (!regex.test(el.value)) {
        el.classList.add('error');
        return false
    }

    return true
}

export type MemberData = {
    fio?: string,
    program?: string,
    email?: string,
    tg?: string,
}

interface IMember {
    index: number;
    id: string;
    onDelete: (id: string) => void;
}

export type TRef = {
    state: () => MemberData;
    validate: () => boolean;
}

export const Member = forwardRef<TRef, IMember>(({onDelete, index, id}, ref) => {

    const inputRefs = useRef<{[key in keyof MemberData]: HTMLInputElement | null}>({})

    const setRef = (name: keyof MemberData, ref: HTMLInputElement | null) => {
        inputRefs.current[name] = ref
    }

    useImperativeHandle(ref, () => {
        return {
            state() {
                const data: {[key in keyof MemberData]: string} = {}

                Object.entries(inputRefs.current).forEach((item) => {
                    data[item[0] as keyof MemberData] = item[1]?.value
                })

                return data
            },

            validate() {
                const regexs: {[key in keyof MemberData]: RegExp} = {
                    fio: /^[а-яА-ЯЁё\-\s]{3,70}$/,
                    program: /^[a-zA-Zа-яА-ЯЁё\d\s\-]{2,70}$/,
                    email: /^[a-zA-Z0-9]*@edu\.hse\.ru$/,
                    tg: /^@[a-zA-Z0-9]*$/
                }

                let valid = true

                Object.entries(inputRefs.current).forEach((item) => {
                    const isValid = validateValue(item[1], regexs[item[0] as keyof MemberData])
                    if (!isValid && valid) {
                        valid = false
                    }   
                })

                return valid
            }
        }
    }, [])

    const onFocus = (event: FocusEvent<HTMLInputElement>) => {
        event.target.classList.remove('error')
    }

    return (
        <div className="member-container">
            <div className="member-info">
                <div className="member-header">
                    <h1 className="member-title">Участник №{index + 1}</h1>
                    <button className="delete-btn" type="button" onClick={() => onDelete(id)}></button>
                </div>
                <div className="inputs">
                    <div className="form-label">
                        <input className="input" placeholder="Иванов Иван Иванович" name='fio' ref={ref => setRef('fio', ref)} onFocus={onFocus}/>
                        <p className="label-title">ФИО</p>
                    </div>
                    <div className="form-label">
                        <input className="input" placeholder="ИВТ" name='program' ref={ref => setRef('program', ref)} onFocus={onFocus}/>
                        <p className="label-title">ОП</p>
                    </div>
                    <div className="form-label">
                        <input className="input" placeholder="iiivanov@edu.hse.ru" name='email' ref={ref => setRef('email', ref)} onFocus={onFocus}/>
                        <p className="label-title">Почта edu.hse</p>
                    </div>
                    <div className="form-label">
                        <input className="input" placeholder="В формате @iiivanov" name='tg' ref={ref => setRef('tg', ref)} onFocus={onFocus}/>
                        <p className="label-title">Telegram</p>
                    </div>
                </div>
            </div>
        </div>
    )
})