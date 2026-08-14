import { createContext, useContext, useState } from "react";

const QueueContext = createContext();

export function QueueProvider({ children }) {
  const [currentToken, setCurrentToken] = useState(39);
  const [peopleAhead, setPeopleAhead] = useState(8);
  const [served, setServed] = useState(82);

  const userToken = 47;

  const estimatedWait = peopleAhead * 2;

  function callNext() {
    if (peopleAhead === 0) return;

    setCurrentToken((value) => value + 1);
    setPeopleAhead((value) => value - 1);
  }

  function completeService() {
    setServed((value) => value + 1);
  }

  function resetQueue() {
    setCurrentToken(39);
    setPeopleAhead(8);
    setServed(82);
  }

  return (
    <QueueContext.Provider
      value={{
        currentToken,
        peopleAhead,
        served,
        userToken,
        estimatedWait,
        callNext,
        completeService,
        resetQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}