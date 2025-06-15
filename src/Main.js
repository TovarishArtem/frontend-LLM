import  { useState, useEffect, useRef } from 'react';
import Joyride from 'react-joyride';
import ParticlesBackground from './ParticlesBackground';
import DialogСhat from './components/DialogСhat';
import Header from './components/Header';
import Nav from './components/Nav';
import Question from './components/Question';
import InstructionModal from './components/InstructionModal';
import CustomTooltip from './components/CustomTooltip';



const Main = () => {
  const [runTour, setRunTour] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAside, setShowAside] = useState(false);
  const [model, setModel] = useState('llama3.2-vision');
  const [dialogs, setDialogs] = useState([]);
  // const [currentDialog, setCurrentDialog] = useState(null);
  const [currentDialogId, setCurrentDialogId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // Флаг для отслеживания запроса
  const hasFetchedDialogs = useRef(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL_API;
  

  useEffect(() => {
  const hasSeenTour = localStorage.getItem("hasSeenTour");
  if (!hasSeenTour) setShowModal(true);

  if (hasFetchedDialogs.current) return;
  hasFetchedDialogs.current = true;

  const fetchDialogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(BASE_URL + "/chats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при получении чатов");

      const data = await res.json();

      const normalizedDialogs = data.map(dialog => ({
        ...dialog,
        name: dialog.title || "Без названия",
        messages: [],
      }));

      setDialogs(normalizedDialogs);

      if (normalizedDialogs.length > 0) {
        const savedId = localStorage.getItem("currentDialogId");
        const found = normalizedDialogs.find(d => d.id === Number(savedId));
        const idToUse = found ? found.id : normalizedDialogs[0].id;

        setCurrentDialogId(idToUse);
        localStorage.setItem("currentDialogId", idToUse);
      } else {
        createNewDialog();
      }
    } catch (err) {
      console.error("Ошибка при загрузке диалогов:", err);
      createNewDialog();
    }
  };

    fetchDialogs();
  }, []);

  const selectedDialog = dialogs.find(d => d.id === currentDialogId);

  const fetchSingleChatById = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/chat/${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при получении чата");

      const data = await res.json();

      // Преобразуем сообщения из message_set
      const messages = data.message_set.flatMap((msg, index) => {
    const userMessage = {
      id: index * 2 + 1,
      sender: "user",
      text: msg.text ?? "",
      image: msg.image ? BASE_URL + msg.image : null,
      createdAt: msg.created_at,
    };

    let assistantResponse =
    Array.isArray(msg.response) ? msg.response.join("\n") : msg.response ?? "";
    // Удаляем ненужную фразу
    assistantResponse = assistantResponse.replace(/^This is a dialog with AI assistant\.?\s*/i, "");

    const assistantMessage = {
      id: index * 2 + 2,
      sender: "assistant",
      text: assistantResponse, // 💡 Точно строка
      createdAt: msg.created_at,
    };

    return [userMessage, assistantMessage]});
    
      // Обновляем dialogs
      setDialogs((prevDialogs) =>
      prevDialogs.map((dialog) =>
        dialog.id === data.id
          ? {
              ...dialog,
              name: data.title,
              messages: messages,
            }
          : dialog
    )
  );

      // Устанавливаем активный диалог
      setCurrentDialogId(chatId);
    } catch (error) {
      console.error("Ошибка загрузки чата по ID:", error);
    }
  };


    useEffect(() => {
      if (currentDialogId) {
        fetchSingleChatById(currentDialogId); 
        localStorage.setItem("currentDialogId", currentDialogId);
      }
    }, [currentDialogId]);

  

    const createNewDialog = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(BASE_URL + "/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: "Новый диалог", active: false }),
        });

        if (!res.ok) throw new Error("Ошибка при создании чата");

        const newDialog = await res.json();
        setDialogs(prev => [...prev, newDialog]);
        setCurrentDialogId(newDialog.id);
      } catch (err) {
        console.error("Ошибка создания чата:", err);
      }
    };

  // const deleteDialog = id => {
  //   setDialogs(prev => {
  //     const filtered = prev.filter(d => d.id !== id);
  //     if (filtered.length === 0) {
  //       createNewDialog();
  //       return [];
  //     }
  //     if (id === currentDialogId) {
  //       setCurrentDialogId(filtered[0].id);
  //     }
  //     return filtered;
  //   });
  // };
    const deleteDialog = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Отправка DELETE-запроса на сервер
      const res = await fetch(BASE_URL + `/chat/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Не удалось удалить диалог");

      // Обновление состояния после успешного удаления
      setDialogs((prev) => {
        const filtered = prev.filter((d) => d.id !== id);

        if (filtered.length === 0) {
          createNewDialog();
          return [];
        }

        if (id === currentDialogId) {
          setCurrentDialogId(filtered[0].id);
        }

        return filtered;
      });
    } catch (err) {
      console.error("Ошибка при удалении диалога:", err);
      alert("Ошибка при удалении диалога.");
    }
  };

      const addMessageToCurrentDialog = newMessage => {
      setDialogs(prevDialogs =>
        prevDialogs.map(dialog => {
          if (dialog.id !== currentDialogId) return dialog;

          const messages = dialog.messages ?? [];

          const isFirstMessage = messages.length === 0;
          const updatedName = isFirstMessage
            ? (newMessage.text.length > 30
                ? newMessage.text.slice(0, 30) + "..."
                : newMessage.text || "Новый диалог")
            : dialog.name;

          return {
            ...dialog,
            name: updatedName,
            messages: [...messages, newMessage],
          };
        })
      );
    };
    const cleanResponse = (response, msgText, prompt) => {
    let text = Array.isArray(response) ? response.join("\n") : response ?? "";

    // Если указан prompt — удалить его первое вхождение
    if (prompt && prompt.trim()) {
      const idx = text.indexOf(prompt.trim());
      if (idx !== -1) {
        text = text.slice(idx + prompt.trim().length);
      }
    }

    // Если указан msgText — удалить всё до и включая его первое вхождение
    if (msgText && msgText.trim()) {
      const idx = text.indexOf(msgText.trim());
      if (idx !== -1) {
        text = text.slice(idx + msgText.trim().length);
      }
    }

    // Удалить лишние пробелы и повторяющиеся пустые строки
    text = text
      .split('\n')
      .map(line => line.trim())
      .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
      .join('\n');

    return text.trim();
    }



    const createMessageUser = (message, imageFile) => {
      if (isRequesting) return;

      const timestamp = Date.now();
      setIsRequesting(true);

      // Проверка изображения ДО всего
      const fileType = imageFile?.type?.toLowerCase();
      const isValidImage =
        imageFile && fileType.startsWith("image/") && fileType !== "image/svg+xml";

      const maxSizeMB = 5;
      const isTooLarge = imageFile && imageFile.size > maxSizeMB * 1024 * 1024;

      if (imageFile && (!isValidImage || isTooLarge)) {
        const reason = !isValidImage
          ? "Пожалуйста, загрузите корректное изображение (кроме SVG)."
          : `Размер изображения не должен превышать ${maxSizeMB} МБ.`;
        alert(reason);
        setIsRequesting(false);
        return;
      }

      // Создаем пользовательское сообщение и временное ассистентское
      const userMessage = {
        id: timestamp,
        sender: "user",
        text: message,
        image: imageFile ? `${BASE_URL}/media/images/${encodeURIComponent(imageFile.name)}` : null,
      };

      const tempAssistantMessage = {
        id: timestamp + 1,
        sender: "assistant",
        text: "Модель думает...",
        image: null,
      };

      addMessageToCurrentDialog(userMessage);
      addMessageToCurrentDialog(tempAssistantMessage);

      const sendMessageToHttpAPI = async (msgText, imageFileObject, assistantMsgId) => {
        try {
          const token = localStorage.getItem("token");
          const settings = JSON.parse(localStorage.getItem('generationSettings')) || {};
          const promptPattern = settings.prompt || 'Это Диалог с искусственным интелектом';

          const ask = {
            prompt: promptPattern,
            num_beams: settings.numBeams ?? 2,
            max_new_tokens: settings.maxLength ?? 300,
            do_sample: settings.doSample ?? false,
            early_stoping: settings.earlyStopping ?? false,
            num_return_sequences: settings.numReturnSequences ?? 1,
          };

          if (ask.num_return_sequences > ask.num_beams) {
            ask.num_return_sequences = ask.num_beams;
          }

          const formData = new FormData();
          formData.append("text", msgText);
          formData.append("chat", currentDialogId.toString());
          formData.append("ask", JSON.stringify(ask));

          if (imageFileObject) {
            formData.append("image", imageFileObject);
          }

          const response = await fetch(BASE_URL + "/message", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error("Ошибка от сервера:", errText);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          if (result.response) {
            let normalizedResponse = Array.isArray(result.response)
              ? result.response.join("\n")
              : result.response;

            normalizedResponse = cleanResponse(normalizedResponse, msgText, promptPattern);
            console.log(normalizedResponse)
            updateAssistantMessage(
              assistantMsgId,
              normalizedResponse,
              result.image || result.image_url || null // <- добавили image
            );
          } else {
            updateAssistantMessage(
              assistantMsgId,
              "Ответ от модели пуст или не получен."
            );
          }
        } catch (error) {
          console.error("Ошибка при отправке:", error);
          updateAssistantMessage(
            assistantMsgId,
            "Ошибка: не удалось получить ответ от модели."
          );
        } finally {
          setIsRequesting(false);
        }
      };

      sendMessageToHttpAPI(message, imageFile || null, tempAssistantMessage.id);
    };

    const updateAssistantMessage = (id, newText, image = null) => {
        const normalizedText = Array.isArray(newText)
          ? newText.join("\n")
          : newText ?? "";

        // добавляем преобразование относительного пути в абсолютный
        const normalizedImage = image
          ? (image.startsWith('http') ? image : BASE_URL + image)
          : null;

        setDialogs(prevDialogs =>
          prevDialogs.map(dialog => {
            if (dialog.id !== currentDialogId) return dialog;
            return {
              ...dialog,
              messages: dialog.messages.map(msg =>
                msg.id === id ? { ...msg, text: normalizedText, image: normalizedImage } : msg
              ),
            };
          })
        );
      };


  // const pollForResult = async (requestId, assistantMsgId) => {
  //   try {
  //     const interval = setInterval(async () => {
  //       const res = await fetch(`http://127.0.0.1:8000/result/${requestId}`);
  //       const data = await res.json();

  //       if (data?.response) {
  //         clearInterval(interval);
  //         updateAssistantMessage(assistantMsgId, data.response);
  //       }
  //     }, 1500);
  //   } catch (e) {
  //     console.error('Ошибка получения ответа:', e);
  //   }
  // };

  const startTour = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setShowModal(false);
    setRunTour(false);
    setTimeout(() => setRunTour(true), 0);
  };

  const steps = [
	{
		target: '.header',
    	content: 'Тут в верхней панели вы можете выбрать модель для работы, выйти из аккаунта, пройти инструктаж по интерфейсу и открыть боковую панель с дополнительными функциями',
	},
    {
      target: '.dialog_chat',
      content: 'Здесь происходит переписка с ассистентом',
    },
    {
      target: '.question_container',
      content: 'Здесь можете задать вопрос и прикрепить изображение',
    },
	{
		target: '.nav_desktop',
		content: 'Здесь находяться ваши истории диалогов. Вы можете создавать новые диалоги и возращаться к другим. А так же тут етсь настройки модели для улучшения качества ответа модеи'
	},
  ];

  return (
    <div className='App'>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        tooltipComponent={CustomTooltip}
        styles={{ options: { zIndex: 9999 } }}
      />

      <ParticlesBackground />
      <Header className='header'
        model={model}
        setModel={setModel}
        setShowAside={() => setShowAside(!showAside)}
        onStartTour={() => setShowModal(true)}
      />

      <div className='container_nav_and_main'>
        <Nav data-tour="nav" className='nav'
          dialogs={dialogs}
          currentDialogId={currentDialogId}
         onSelect={(dialogId) => setCurrentDialogId(dialogId)}
          onCreate={createNewDialog}
          onDelete={deleteDialog}
          onShowAside={showAside}
        />
        <main>
          <div className='container_win_chat_and_img'>
            <div className='win_chat'>
              {selectedDialog && (
                <DialogСhat
                  messages={selectedDialog.messages || []}
                  className='dialog_chat'
                />
              )}
              <Question createQuestion={createMessageUser} />
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <InstructionModal
          onStart={startTour}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Main;
