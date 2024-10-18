import { API_BASE } from "./consts";

export const login = async (code: string) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  return [await res.json(), res.status];
};

export const refresh = async (token: string, refresh_token: string) => {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({ refresh_token }),
  });
  return [await res.json(), res.status];
};

export const logout = async (token: string) => {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });
  return [await res.json(), res.status];
};

export const getInfo = async (token: string) => {
  const res = await fetch(`${API_BASE}/info`, {
    headers: {
      token,
    },
  });
  return [await res.json(), res.status];
};

export const getRandomAttachment = async (
  token: string,
  videoOnly: boolean
) => {
  const res = await fetch(
    `${API_BASE}/attachment/random?video_only=${videoOnly}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    }
  );
  return [await res.json(), res.status];
};

export const getAttachment = async (token: string, attachmentId: string) => {
  const res = await fetch(`${API_BASE}/attachment/view/${attachmentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });
  return [await res.json(), res.status];
};

export const getRandomMessage = async (token: string, minLength: number) => {
  const res = await fetch(
    `${API_BASE}/message/random?min_length=${minLength}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    }
  );
  return [await res.json(), res.status];
};

export const getMessage = async (token: string, messageId: string) => {
  const res = await fetch(`${API_BASE}/message/view/${messageId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });
  return [await res.json(), res.status];
};

export const getLikes = async (token: string) => {
  const res = await fetch(`${API_BASE}/likes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });
  return [await res.json(), res.status];
};

export const sendLike = async (
  token: string,
  id: string,
  isAttachment: boolean
) => {
  const res = await fetch(`${API_BASE}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({ id, is_attachment: isAttachment }),
  });
  return [await res.json(), res.status];
};

export const sendUnlike = async (
  token: string,
  id: string,
  isAttachment: boolean
) => {
  const res = await fetch(`${API_BASE}/unlike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({ id, is_attachment: isAttachment }),
  });
  return [await res.json(), res.status];
};

export const getLeaderboard = async (token: string) => {
  const res = await fetch(`${API_BASE}/leaderboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      token,
    },
  });
  return [await res.json(), res.status];
};
