class Messenger {
	constructor(
		chatMessageContainer,
		messageInput,
		webSocket = null,
		sendBtn = null,
		geoBtn = null
	) {
		this.chatMessageContainer = chatMessageContainer;
		this.messageInput = messageInput;
		this.message = "";
		this.messageType = "user";
		this.webSocket = webSocket;
		this.sendBtn = sendBtn;
		this.geoBtn = geoBtn;
		this.geo = false;

		this.init();
		this.webSocketEventsInit();
		this.refreshMessageContainer();
	}

	rotate(element) {
		element.classList.add("bi-globe-central-south-asia", "rotate");
		element.classList.remove("bi-geo-alt");
	}

	stopRotate(element) {
		element.classList.add("bi-geo-alt");
		element.classList.remove("bi-globe-central-south-asia", "rotate");
	}

	init() {
		if (this.sendBtn !== null) {
			this.sendBtn.addEventListener("click", (e) => {
				this.addMessage(this.messageInput.value);
			});
		}

		/*
			Обрабатываем кнопку
			Отправить геолокацию
			Также добавим анимацию загрузки
			И обработку чтоб нельзя было часто нажимать
		*/
		if (this.geoBtn !== null) {
			const geoIcon = this.geoBtn.querySelector("i");
			this.geoBtn.addEventListener("click", (e) => {
				if (!this.geoBtn.classList.contains("active")) {
					this.geoBtn.classList.add("active");
					this.rotate(geoIcon);
					if ("geolocation" in navigator) {
						navigator.geolocation.getCurrentPosition((position) => {
							const { coords } = position;
							let message = `<a href="https://www.openstreetmap.org/#mao=18/${coords.latitude}/${coords.longitude}">Гео локация</a>`;
							this.addMessage(message, "geo");
							this.stopRotate(geoIcon);
							this.geoBtn.classList.remove("active");
						});
					}
				}
			});
		}

		addEventListener("keypress", (e) => {
			if (e.code === "Enter") {
				this.addMessage(this.messageInput.value);
			}
		});
	}

	refreshMessageContainer() {
		/*
			Обнуление поля ввода
			Скролл к новым сообщениям
			Фокус поля воода
		*/

		if (this.messageType === "user") {
			this.messageInput.value = "";
		}

		this.chatMessageContainer.scrollTop =
			this.chatMessageContainer.scrollHeight;
		this.messageInput.focus();
	}

	htmlToElements(html) {
		var template = document.createElement("template");
		template.innerHTML = html;
		return template.content.childNodes;
	}

	/*
		 Добавление сообщения
		 В общий контейнер с сообщениями
	*/
	appendMessageContainer() {
		let messageTemplate = `
			<div class="chat__message chat__${this.messageType}-message">
				${this.message}
			</div>
		`;

		this.chatMessageContainer.insertAdjacentHTML("beforeend", messageTemplate);

		this.refreshMessageContainer();
	}

	addMessage(message = "", messageType = "user") {
		if (message !== "") {
			this.message = message;
			this.messageType = messageType;

			/*
				Проверка на юзера
				Если от пользователя то отправляем
				на сервер с помощью вебсокета
			*/
			messageType === "user" ? this.webSocket.send(this.message) : true;
			this.appendMessageContainer();
		}
	}

	webSocketEventsInit() {
		this.webSocket.onopen = (e) => {
			this.chatMessageContainer.parentNode
				.querySelector(".chat__status")
				.classList.add("online");
		};

		this.webSocket.onclose = (e) => {};

		this.webSocket.onmessage = (e) => {
			this.addMessage(e.data, "server");
			//this.addMessage(e.data.split("").reverse().join(""), "server");
		};

		this.webSocket.onerror = (e) => {};
	}
}
