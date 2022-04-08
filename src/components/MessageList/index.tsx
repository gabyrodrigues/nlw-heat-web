import { useEffect, useState } from 'react'
import { api } from '../../services/api'

import styles from './styles.module.scss'

import logoImg from '../../assets/logo.svg'
import { io } from 'socket.io-client'

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

const messagesQueue: Message[] = []

const socket = io('http://localhost:4000')

socket.on('new_message', (newMessage: Message) => {
  messagesQueue.push(newMessage) //insert sent messages on queue
})

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setInterval(() => {
      if(messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0], //in array first position, insert first (oldest) message from queue
          prevState[0], //get already existing messages from first position of messages array
          prevState[1] //get already existing messages from second position of messages array
        ].filter(Boolean)) //filter to remove undefined/null values

        messagesQueue.shift()
      }
    }, 3000)
  }, [])

  useEffect(() => {
    api.get<Message[]>('/messages/last3').then(response => {
      setMessages(response.data)
    })
  }, [])

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map(message => (
          <li className={styles.message} key={message.id}>
            <p className={styles.messageContent}>{message.text}</p>

            <div className={styles.messageUser}>
              <div className={styles.userImage}>
                <img src={message.user.avatar_url} alt={message.user.name} />
              </div>
              <span>{message.user.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}