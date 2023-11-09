import React, { ChangeEvent, FormEvent, useRef, useState, FocusEvent, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import '../src/components/Member.css'
import { Member, MemberData, TRef } from './components/Member'

const generateId = () => {
  return Math.floor(Math.random() * Date.now()).toString(36);
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'success':
      return 'Отправлено!'
    case 'pending':
      return 'Отправляем...'
    case 'error':
      return 'Ошибка!'
    default:
      return 'Отправить'
  }
}

function App() {
  const refs = useRef<{[key: string]: TRef | null}>({});
  const [ids, setIds] = useState([generateId(), generateId()]);
  const [status, setStatus] = useState('')
  const teamRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const isIframe = () => {
        try {
          return window.self !== window.top
        } catch (e) {
          return true
        }
      }

      if (isIframe()) {
        window.parent.postMessage({height: entries[0].target.clientHeight}, 'https://technoforge-rpa.ru')
      }
    })

    resizeObserver.observe(document.body)

    return () => {
      resizeObserver.unobserve(document.body)
    }
  }, [])
  
  const setRef = (id: string, ref: TRef | null) => {
    if (!refs.current[id]) {
      refs.current[id] = ref
    }
  }

  const onRemove = (id: string) => {
    if (ids.length > 2) {
      const copy = [...ids]
      const index = ids.indexOf(id)
      copy.splice(index, 1)
      delete refs.current[id]

      setIds(copy)
    }
  }

  const addMember = () => {
    if (ids.length < 4) {
      setIds(prevState => ([...prevState, generateId()]))
    }
  }

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      let valid = true
      if (!teamRef.current?.value || teamRef.current.value.length < 3) {
        teamRef.current?.classList.add('error')
        return
      }
      Object.values(refs.current).forEach(item => {
        if (item) {
          const isValid = item.validate()
          if (!isValid && valid) {
            valid = isValid
          }
        }
      })

      if (!valid) {
        return
      }

      setStatus('pending')

      const members: MemberData[] = [] 

      Object.entries(refs.current).forEach(item => {
        if (item[1]) {
          members.push(item[1]?.state())
        }
      })

      const response = await fetch('/form', {
        method: 'POST',
        body: JSON.stringify({
          team: teamRef.current?.value,
          members: members
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        (event.target as HTMLFormElement).reset()
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (e) {
      setStatus('error')
    }
  }

  const onFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.classList.remove('error');
  }

  return (
    <>
      <h1 className='form-title'>Регистрируйся!</h1>
      <p className='form-description'>Не забудь заполнить регистрационную форму, чтобы принять участие в хакатоне</p>
      <form className='form' onSubmit={onSubmitForm}>
        <input className='team' onFocus={onFocus} placeholder='Название команды' ref={teamRef}/>
        {ids.map((item, index) => {
          return (
            <Member
              key={item}
              ref={ref => setRef(item, ref)}
              index={index}
              onDelete={onRemove}
              id={item}
            />)
        })}
        <div className='actions'>
          <button className={`send-btn ${status}`} disabled={status === 'success' || status === 'loading'} type='submit'>{getStatusText(status)}</button>
          <button className='add-member-btn' type='button' disabled={ids.length > 3} onClick={addMember}>Добавить участника</button>
        </div>
      </form>
    </>
  );
}

export default App;
