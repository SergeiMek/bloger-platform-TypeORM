import {
  questionBody,
  questionCorrectAnswer01,
  questionCorrectAnswer02,
  questionCorrectAnswer03,
  questionCorrectAnswerNumeric,
  questionUpdatedBody,
} from '../constants/quiz.constants';

export const user01Login = 'login01';
export const user02Login = 'login02';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export const questionCreatedObject = {
  id: expect.any(String),
  body: questionBody,
  correctAnswers: [
    questionCorrectAnswer01,
    questionCorrectAnswer02,
    questionCorrectAnswer03,
  ],
  published: false,
  createdAt: expect.any(String),
  updatedAt: null,
};

export const questionUpdatedObject = {
  id: expect.any(String),
  body: questionUpdatedBody,
  correctAnswers: [
    questionCorrectAnswer01,
    questionCorrectAnswer02,
    questionCorrectAnswer03,
    questionCorrectAnswerNumeric.toString(),
  ],
  published: false,
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

export const createdGameObject = {
  id: expect.any(String),
  firstPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: user01Login,
    },
    score: 0,
  },
  secondPlayerProgress: null,
  questions: null,
  status: GameStatus.PendingSecondPlayer,
  pairCreatedDate: expect.any(String),
  startGameDate: null,
  finishGameDate: null,
};

export const startedGameObject = {
  id: expect.any(String),
  firstPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: user01Login,
    },
    score: 0,
  },
  secondPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: user02Login,
    },
    score: 0,
  },
  questions: [
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
  ],
  status: GameStatus.Active,
  pairCreatedDate: expect.any(String),
  startGameDate: expect.any(String),
  finishGameDate: null,
};
