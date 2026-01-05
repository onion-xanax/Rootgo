class DossierCreator {
    constructor() {
        this.container = document.getElementById('dot-container');
        this.sandbox = document.getElementById('sandbox');
        this.logosContainer = document.getElementById('logos-container');
        this.documentsContainer = document.getElementById('documents-container');
        this.dots = [];
        this.spacing = 25;
        this.activeDocument = null;
        this.documentsInSandbox = [];
        this.backgroundLogos = [];
        this.logoFiles = [];
        this.contextMenu = document.getElementById('logoContextMenu');
        this.contextMenuLogo = null;
        this.init();
    }

    init() {
        this.createDots();
        this.loadLogoFiles();
        this.loadDocuments();
        this.setupEventListeners();
        this.setupBackgroundDrop();
        this.setupContextMenu();
        window.addEventListener('resize', () => this.updateDots());
        this.updateLogoCount();
    }

    loadLogoFiles() {
        this.logoFiles = [];

        for (let i = 1; i <= 24; i++) {
            this.logoFiles.push({
                id: i,
                name: `Логотип ${i}`,
                url: `/dosier/logo/logo${i}.jpg`,
                alt: `Логотип ${i}`,
                displayName: `Лого ${i}`
            });
        }

        this.renderLogos();
    }

    renderLogos() {
        this.logosContainer.innerHTML = '';

        this.logoFiles.forEach(logo => {
            const logoItem = document.createElement('div');
            logoItem.className = 'logo-item';
            logoItem.draggable = true;
            logoItem.dataset.id = logo.id;
            logoItem.dataset.name = logo.name;
            logoItem.dataset.url = logo.url;

            const logoImg = document.createElement('img');
            logoImg.className = 'logo-jpg';
            logoImg.alt = logo.alt;
            logoImg.draggable = false;

            const img = new Image();
            img.onload = () => {
                logoImg.src = logo.url;
            };
            img.onerror = () => {
                logoImg.src = '';
                logoImg.style.background = '#444';
                logoImg.style.display = 'flex';
                logoImg.style.alignItems = 'center';
                logoImg.style.justifyContent = 'center';
                logoImg.innerHTML = `<span style="color:#888;font-size:0.8em;">${logo.displayName}</span>`;
            };
            img.src = logo.url;

            const logoLabel = document.createElement('div');
            logoLabel.className = 'logo-label';
            logoLabel.textContent = logo.displayName;

            logoItem.appendChild(logoImg);
            logoItem.appendChild(logoLabel);
            this.logosContainer.appendChild(logoItem);

            logoItem.addEventListener('dragstart', (e) => {
                logoItem.classList.add('dragging');

                const data = {
                    type: 'logo',
                    id: logo.id,
                    url: logo.url,
                    name: logo.name
                };

                console.log('Drag start data:', data); // Для отладки

                e.dataTransfer.setData('application/json', JSON.stringify(data));
                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                e.dataTransfer.setDragImage(logoImg, 50, 50);
            });

            logoItem.addEventListener('dragend', () => {
                logoItem.classList.remove('dragging');
            });
        });

        document.querySelector('.logo-count').textContent = this.logoFiles.length;
    }

    setupBackgroundDrop() {
        document.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            document.body.classList.add('drop-zone');
        });

        document.body.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget || !document.body.contains(e.relatedTarget)) {
                document.body.classList.remove('drop-zone');
            }
        });

        document.body.addEventListener('drop', (e) => {
            e.preventDefault();
            document.body.classList.remove('drop-zone');

            let data;

            try {
                data = JSON.parse(e.dataTransfer.getData('application/json'));
            } catch (err1) {
                try {
                    data = JSON.parse(e.dataTransfer.getData('text/plain'));
                } catch (err2) {
                    console.log('Не удалось получить данные перетаскивания');
                    return;
                }
            }

            console.log('Drop data received:', data); // Для отладки

            if (data && data.type === 'logo') {
                this.addLogoToBackground(data, e.clientX, e.clientY);
            }
        });
    }

    addLogoToBackground(logoData, x, y) {
        console.log('Adding logo to background:', logoData); // Для отладки

        const logo = document.createElement('img');
        logo.className = 'logo-on-bg';
        logo.alt = logoData.name || 'Логотип';
        logo.dataset.id = Date.now();
        logo.dataset.name = logoData.name || 'Логотип';

        const imageUrl = logoData.url || '/dosier/logo/default.jpg';
        console.log('Image URL:', imageUrl); // Для отладки

        const img = new Image();
        img.onload = () => {
            logo.src = img.src;
        };
        img.onerror = () => {
            console.log('Image load error for URL:', imageUrl); // Для отладки
            logo.style.background = '#444';
            logo.style.display = 'flex';
            logo.style.alignItems = 'center';
            logo.style.justifyContent = 'center';
            logo.innerHTML = `<span style="color:#888;font-size:0.8em;">${(logoData.name || 'Лого').substring(0, 10)}</span>`;
        };
        img.src = imageUrl;

        logo.style.left = `${x - 50}px`;
        logo.style.top = `${y - 50}px`;

        const size = 80 + Math.random() * 40;
        logo.style.width = `${size}px`;
        logo.style.height = `${size}px`;

        const rotation = -15 + Math.random() * 30;
        logo.style.transform = `rotate(${rotation}deg)`;

        document.body.appendChild(logo);
        this.backgroundLogos.push(logo);

        this.makeLogoDraggable(logo);
        this.makeLogoResizable(logo);
        this.updateLogoCount();

        this.playDropSound();
    }

    makeLogoDraggable(logo) {
        let isDragging = false;
        let offsetX, offsetY;
        let startX, startY;

        logo.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            isDragging = true;
            offsetX = e.clientX - logo.getBoundingClientRect().left;
            offsetY = e.clientY - logo.getBoundingClientRect().top;
            startX = e.clientX;
            startY = e.clientY;

            logo.style.cursor = 'grabbing';
            logo.style.zIndex = '1000';

            const moveHandler = (e) => {
                if (!isDragging) return;

                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;

                logo.style.left = `${newX}px`;
                logo.style.top = `${newY}px`;
            };

            const upHandler = (e) => {
                isDragging = false;
                logo.style.cursor = 'move';
                logo.style.zIndex = '10';

                const moveDistance = Math.sqrt(
                    Math.pow(e.clientX - startX, 2) +
                    Math.pow(e.clientY - startY, 2)
                );

                if (moveDistance < 5) {
                    this.openContextMenu(logo, e.clientX, e.clientY);
                }

                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        });
    }

    makeLogoResizable(logo) {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            right: -10px;
            bottom: -10px;
            width: 20px;
            height: 20px;
            cursor: se-resize;
            background: #00ffff;
            border-radius: 50%;
            border: 2px solid #0a0a0a;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 100;
        `;

        logo.appendChild(resizeHandle);

        let isResizing = false;

        logo.addEventListener('mouseenter', () => {
            resizeHandle.style.opacity = '0.7';
        });

        logo.addEventListener('mouseleave', () => {
            if (!isResizing) {
                resizeHandle.style.opacity = '0';
            }
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            const startWidth = logo.offsetWidth;
            const startHeight = logo.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;

            const resizeHandler = (e) => {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const delta = Math.max(deltaX, deltaY);

                const newSize = Math.max(50, Math.min(300, startWidth + delta));
                logo.style.width = `${newSize}px`;
                logo.style.height = `${newSize}px`;
            };

            const upHandler = () => {
                isResizing = false;
                resizeHandle.style.opacity = '0';
                document.removeEventListener('mousemove', resizeHandler);
                document.removeEventListener('mouseup', upHandler);
            };

            document.addEventListener('mousemove', resizeHandler);
            document.addEventListener('mouseup', upHandler);
        });
    }

    setupContextMenu() {
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.contextMenu.style.display = 'none';
            }
        });

        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('logo-on-bg')) {
                e.preventDefault();
                this.openContextMenu(e.target, e.clientX, e.clientY);
            }
        });
    }

    openContextMenu(logo, x, y) {
        this.contextMenuLogo = logo;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;

        const menuRect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (x + menuRect.width > windowWidth) {
            this.contextMenu.style.left = `${windowWidth - menuRect.width - 10}px`;
        }

        if (y + menuRect.height > windowHeight) {
            this.contextMenu.style.top = `${windowHeight - menuRect.height - 10}px`;
        }
    }

    updateLogoCount() {
        document.getElementById('logoCount').textContent = this.backgroundLogos.length;
    }

    clearBackgroundLogos() {
        this.backgroundLogos.forEach(logo => logo.remove());
        this.backgroundLogos = [];
        this.updateLogoCount();
    }

    arrangeLogosGrid() {
        const cols = Math.ceil(Math.sqrt(this.backgroundLogos.length));
        const padding = 20;
        const logoSize = 100;

        this.backgroundLogos.forEach((logo, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            const x = padding + col * (logoSize + padding);
            const y = 150 + row * (logoSize + padding);

            logo.style.left = `${x}px`;
            logo.style.top = `${y}px`;
            logo.style.width = `${logoSize}px`;
            logo.style.height = `${logoSize}px`;
            logo.style.transform = 'rotate(0deg)';
            logo.style.transition = 'all 0.5s ease';

            setTimeout(() => {
                logo.style.transition = '';
            }, 500);
        });
    }

    arrangeLogosCircle() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = Math.min(centerX, centerY) - 150;

        this.backgroundLogos.forEach((logo, index) => {
            const angle = (index / this.backgroundLogos.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius - 50;
            const y = centerY + Math.sin(angle) * radius - 50;

            logo.style.left = `${x}px`;
            logo.style.top = `${y}px`;
            logo.style.transform = `rotate(${angle * (180 / Math.PI)}deg)`;
            logo.style.transition = 'all 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

            setTimeout(() => {
                logo.style.transition = '';
            }, 700);
        });
    }

    randomizeLogos() {
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        this.backgroundLogos.forEach(logo => {
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            const size = 60 + Math.random() * 90;
            const rotation = -45 + Math.random() * 90;

            logo.style.left = `${x}px`;
            logo.style.top = `${y}px`;
            logo.style.width = `${size}px`;
            logo.style.height = `${size}px`;
            logo.style.transform = `rotate(${rotation}deg)`;
            logo.style.transition = 'all 0.4s ease';

            setTimeout(() => {
                logo.style.transition = '';
            }, 400);
        });
    }

    playDropSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
        }
    }

    createDots() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cols = Math.floor(width / this.spacing) + 1;
        const rows = Math.floor(height / this.spacing) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                dot.style.left = `${col * this.spacing}px`;
                dot.style.top = `${row * this.spacing}px`;
                this.container.appendChild(dot);
                this.dots.push(dot);
            }
        }
    }

    updateDots() {
        this.container.innerHTML = '';
        this.dots = [];
        this.createDots();
    }

    loadDocuments() {
        const documents = [
            {
                title: 'Паспорт РФ',
                icon: 'passport',
                fields: ['ФИО', 'Серия и номер', 'Дата выдачи', 'Кем выдан', 'Дата рождения', 'Место рождения', 'Адрес регистрации']
            },
            {
                title: 'Водительское удостоверение',
                icon: 'license',
                fields: ['ФИО', 'Номер удостоверения', 'Категории', 'Дата выдачи', 'Срок действия', 'Дата рождения', 'Адрес']
            },
            {
                title: 'Заграничный паспорт',
                icon: 'passport',
                fields: ['ФИО', 'Номер паспорта', 'Гражданство', 'Дата рождения', 'Место рождения', 'Дата выдачи', 'Орган выдавший']
            },
            {
                title: 'СНИЛС',
                icon: 'id',
                fields: ['ФИО', 'Номер СНИЛС', 'Дата рождения', 'Пол', 'Дата регистрации']
            },
            {
                title: 'ИНН',
                icon: 'id',
                fields: ['ФИО', 'Номер ИНН', 'Дата рождения', 'Место рождения', 'Дата постановки на учет']
            },
            {
                title: 'Банковская карта',
                icon: 'bank',
                fields: ['Номер карты', 'Держатель карты', 'Срок действия', 'CVV код', 'Банк-эмитент']
            },
            {
                title: 'Медицинский полис',
                icon: 'insurance',
                fields: ['ФИО', 'Номер полиса', 'Страховая компания', 'Срок действия', 'Дата рождения']
            },
            {
                title: 'Военный билет',
                icon: 'id',
                fields: ['ФИО', 'Номер билета', 'Звание', 'ВУС', 'Годность', 'Дата рождения', 'Военкомат']
            },
            {
                title: 'Свидетельство о рождении',
                icon: 'document',
                fields: ['ФИО', 'Номер свидетельства', 'Дата рождения', 'Место рождения', 'ФИО родителей', 'Дата выдачи', 'Орган ЗАГС']
            },
            {
                title: 'Диплом об образовании',
                icon: 'education',
                fields: ['ФИО', 'Номер диплома', 'Специальность', 'Учебное заведение', 'Год окончания', 'Квалификация']
            },
            {
                title: 'Трудовая книжка',
                icon: 'work',
                fields: ['ФИО', 'Серия и номер', 'Место работы', 'Должность', 'Дата приема', 'Дата увольнения']
            },
            {
                title: 'Договор аренды',
                icon: 'contract',
                fields: ['ФИО арендатора', 'ФИО арендодателя', 'Адрес объекта', 'Срок аренды', 'Сумма аренды', 'Дата подписания']
            },
            {
                title: 'Договор купли-продажи',
                icon: 'contract',
                fields: ['ФИО продавца', 'ФИО покупателя', 'Объект продажи', 'Стоимость', 'Дата сделки', 'Место сделки']
            },
            {
                title: 'Справка о доходах',
                icon: 'money',
                fields: ['ФИО', 'Место работы', 'Должность', 'Средний доход', 'Период', 'Дата выдачи']
            },
            {
                title: 'Налоговая декларация',
                icon: 'tax',
                fields: ['ФИО', 'ИНН', 'Период', 'Сумма дохода', 'Сумма налога', 'Дата подачи']
            },
            {
                title: 'Заявление на визу',
                icon: 'document',
                fields: ['ФИО', 'Гражданство', 'Цель поездки', 'Страна назначения', 'Период пребывания', 'Место проживания']
            },
            {
                title: 'Бронь отеля',
                icon: 'ticket',
                fields: ['ФИО гостя', 'Название отеля', 'Даты проживания', 'Номер комнаты', 'Стоимость', 'Способ оплаты']
            },
            {
                title: 'Авиабилет',
                icon: 'ticket',
                fields: ['ФИО пассажира', 'Номер рейса', 'Маршрут', 'Дата вылета', 'Дата прилета', 'Класс обслуживания', 'Стоимость']
            },
            {
                title: 'Железнодорожный билет',
                icon: 'ticket',
                fields: ['ФИО пассажира', 'Номер поезда', 'Маршрут', 'Дата отправления', 'Вагон и место', 'Стоимость']
            },
            {
                title: 'Абонемент в спортзал',
                icon: 'sport',
                fields: ['ФИО', 'Название клуба', 'Тип абонемента', 'Срок действия', 'Стоимость', 'Дата покупки']
            },
            {
                title: 'Медицинская карта',
                icon: 'medical',
                fields: ['ФИО пациента', 'Дата рождения', 'Группа крови', 'Хронические заболевания', 'Аллергии', 'Лечащий врач']
            },
            {
                title: 'Рецепт врача',
                icon: 'medical',
                fields: ['ФИО пациента', 'ФИО врача', 'Диагноз', 'Лекарства', 'Дозировка', 'Дата выписки']
            },
            {
                title: 'Страховой полис',
                icon: 'insurance',
                fields: ['ФИО страхователя', 'Номер полиса', 'Тип страхования', 'Страховая сумма', 'Срок действия', 'Страховая компания']
            },
            {
                title: 'Доверенность',
                icon: 'legal',
                fields: ['ФИО доверителя', 'ФИО поверенного', 'Полномочия', 'Срок действия', 'Дата оформления', 'Нотариус']
            },
            {
                title: 'Завещание',
                icon: 'legal',
                fields: ['ФИО завещателя', 'ФИО наследников', 'Имущество', 'Дата составления', 'Нотариус', 'Место хранения']
            },
            {
                title: 'Свидетельство о браке',
                icon: 'family',
                fields: ['ФИО жениха', 'ФИО невесты', 'Дата регистрации', 'Место регистрации', 'Номер свидетельства', 'Орган ЗАГС']
            },
            {
                title: 'Свидетельство о разводе',
                icon: 'family',
                fields: ['ФИО мужа', 'ФИО жены', 'Дата развода', 'Место развода', 'Номер свидетельства', 'Орган ЗАГС']
            },
            {
                title: 'Справка о составе семьи',
                icon: 'family',
                fields: ['Адрес', 'Состав семьи', 'ФИО членов семьи', 'Дата выдачи', 'Орган выдачи']
            },
            {
                title: 'Выписка из ЕГРН',
                icon: 'property',
                fields: ['ФИО собственника', 'Адрес объекта', 'Кадастровый номер', 'Площадь', 'Права собственности', 'Дата выписки']
            },
            {
                title: 'Кадастровый паспорт',
                icon: 'property',
                fields: ['Кадастровый номер', 'Адрес объекта', 'Площадь', 'Категория земель', 'Разрешенное использование', 'Дата оформления']
            },
            {
                title: 'Технический паспорт',
                icon: 'property',
                fields: ['Адрес объекта', 'Год постройки', 'Материал стен', 'Этажность', 'Общая площадь', 'Кадастровый инженер']
            },
            {
                title: 'Договор подряда',
                icon: 'contract',
                fields: ['ФИО заказчика', 'ФИО подрядчика', 'Объект работ', 'Стоимость работ', 'Срок выполнения', 'Дата подписания']
            },
            {
                title: 'Акт выполненных работ',
                icon: 'contract',
                fields: ['ФИО заказчика', 'ФИО подрядчика', 'Перечень работ', 'Стоимость', 'Дата выполнения', 'Подписи сторон']
            },
            {
                title: 'Счет на оплату',
                icon: 'money',
                fields: ['Поставщик', 'Покупатель', 'Перечень товаров/услуг', 'Сумма', 'Срок оплаты', 'Реквизиты']
            },
            {
                title: 'Накладная',
                icon: 'document',
                fields: ['Отправитель', 'Получатель', 'Товары', 'Количество', 'Стоимость', 'Дата отгрузки', 'Подпись получателя']
            },
            {
                title: 'Счет-фактура',
                icon: 'tax',
                fields: ['Продавец', 'Покупатель', 'Товары', 'Количество', 'Цена', 'Сумма НДС', 'Дата выставления']
            },
            {
                title: 'Товарный чек',
                icon: 'money',
                fields: ['Продавец', 'Товары', 'Количество', 'Цена', 'Итоговая сумма', 'Дата продажи', 'Метод оплаты']
            },
            {
                title: 'Квитанция об оплате',
                icon: 'money',
                fields: ['Получатель платежа', 'Плательщик', 'Назначение платежа', 'Сумма', 'Дата оплаты', 'Способ оплаты']
            },
            {
                title: 'Банковская выписка',
                icon: 'bank',
                fields: ['Владелец счета', 'Номер счета', 'Период', 'Остаток на начало', 'Остаток на конец', 'Список операций']
            },
            {
                title: 'Кредитный договор',
                icon: 'credit',
                fields: ['Заемщик', 'Кредитор', 'Сумма кредита', 'Процентная ставка', 'Срок кредита', 'График платежей', 'Дата заключения']
            },
            {
                title: 'Ипотечный договор',
                icon: 'loan',
                fields: ['Заемщик', 'Кредитор', 'Объект залога', 'Сумма кредита', 'Срок кредита', 'Процентная ставка', 'Дата регистрации']
            },
            {
                title: 'Лизинговый договор',
                icon: 'contract',
                fields: ['Лизингодатель', 'Лизингополучатель', 'Предмет лизинга', 'Срок лизинга', 'Лизинговые платежи', 'Дата заключения']
            },
            {
                title: 'Договор займа',
                icon: 'money',
                fields: ['Заимодавец', 'Заемщик', 'Сумма займа', 'Процентная ставка', 'Срок возврата', 'Дата заключения', 'Подписи сторон']
            },
            {
                title: 'Расписка',
                icon: 'document',
                fields: ['Кредитор', 'Должник', 'Сумма долга', 'Срок возврата', 'Дата составления', 'Подпись должника']
            },
            {
                title: 'Договор поручительства',
                icon: 'legal',
                fields: ['Кредитор', 'Должник', 'Поручитель', 'Сумма обязательства', 'Срок поручительства', 'Дата заключения']
            },
            {
                title: 'Агентский договор',
                icon: 'contract',
                fields: ['Принципал', 'Агент', 'Предмет договора', 'Вознаграждение', 'Срок действия', 'Полномочия агента']
            },
            {
                title: 'Лицензионный договор',
                icon: 'legal',
                fields: ['Лицензиар', 'Лицензиат', 'Объект лицензии', 'Территория действия', 'Срок действия', 'Лицензионный платеж']
            },
            {
                title: 'Договор франчайзинга',
                icon: 'contract',
                fields: ['Франчайзер', 'Франчайзи', 'Франшиза', 'Территория', 'Паушальный взнос', 'Роялти', 'Срок договора']
            },
            {
                title: 'Трудовой договор',
                icon: 'work',
                fields: ['Работодатель', 'Работник', 'Должность', 'Оклад', 'Режим работы', 'Дата приема', 'Срок договора']
            },
            {
                title: 'Договор ГПХ',
                icon: 'contract',
                fields: ['Заказчик', 'Исполнитель', 'Предмет договора', 'Стоимость работ', 'Срок выполнения', 'Дата заключения']
            },
            {
                title: 'Контракт',
                icon: 'contract',
                fields: ['Сторона 1', 'Сторона 2', 'Предмет контракта', 'Стоимость', 'Сроки выполнения', 'Условия оплаты', 'Ответственность сторон']
            },
            {
                title: 'Телефонный справочник',
                icon: 'phone',
                fields: ['ФИО', 'Номер телефона', 'Оператор', 'Тариф', 'Дата подключения', 'Адрес обслуживания']
            },
            {
                title: 'Анкета соцсети',
                icon: 'social',
                fields: ['Никнейм', 'Имя Фамилия', 'Дата рождения', 'Город', 'Образование', 'Работа', 'Интересы']
            },
            {
                title: 'Профиль форума',
                icon: 'forum',
                fields: ['Логин', 'Дата регистрации', 'Количество сообщений', 'Репутация', 'Подписки', 'Подписчики']
            },
            {
                title: 'Блог',
                icon: 'blog',
                fields: ['Название блога', 'Владелец', 'Тематика', 'Количество постов', 'Подписчики', 'Дата создания']
            },
            {
                title: 'Интернет-магазин',
                icon: 'shop',
                fields: ['Название магазина', 'Владелец', 'Категории товаров', 'Рейтинг', 'Отзывы', 'Дата регистрации']
            },
            {
                title: 'Игровой профиль',
                icon: 'game',
                fields: ['Игровой ник', 'Уровень', 'Достижения', 'Игровое время', 'Друзья', 'Дата регистрации']
            },
            {
                title: 'Стриминговый аккаунт',
                icon: 'stream',
                fields: ['Канал', 'Владелец', 'Количество подписчиков', 'Просмотры', 'Донаты', 'Дата создания']
            },
            {
                title: 'Музыкальный профиль',
                icon: 'music',
                fields: ['Артист/Группа', 'Жанр', 'Альбомы', 'Треки', 'Подписчики', 'Дата создания']
            },
            {
                title: 'Арт-портфолио',
                icon: 'art',
                fields: ['Художник', 'Стиль', 'Работы', 'Заказы', 'Рейтинг', 'Дата регистрации']
            },
            {
                title: 'Спортивный профиль',
                icon: 'sport',
                fields: ['Спортсмен', 'Вид спорта', 'Достижения', 'Тренер', 'Клуб', 'Дата начала карьеры']
            },
            {
                title: 'Путешествия',
                icon: 'travel',
                fields: ['Путешественник', 'Посещенные страны', 'Маршруты', 'Отзывы', 'Рейтинг', 'Дата первого путешествия']
            },
            {
                title: 'Кулинарный профиль',
                icon: 'food',
                fields: ['Повар', 'Специализация', 'Рецепты', 'Отзывы', 'Подписчики', 'Дата создания']
            },
            {
                title: 'Профиль питомца',
                icon: 'pet',
                fields: ['Кличка', 'Вид', 'Порода', 'Возраст', 'Владелец', 'Дата рождения']
            }
        ];

        documents.forEach((doc, index) => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item';
            docItem.dataset.index = index;

            const docHeader = document.createElement('div');
            docHeader.className = 'document-header';

            const docIcon = document.createElement('span');
            docIcon.className = `icon icon-${doc.icon}`;

            const docTitle = document.createElement('h4');
            docTitle.textContent = doc.title;

            docHeader.appendChild(docIcon);
            docHeader.appendChild(docTitle);

            const docFields = document.createElement('div');
            docFields.className = 'document-fields';
            docFields.textContent = `Поля: ${doc.fields.slice(0, 3).join(', ')}${doc.fields.length > 3 ? '...' : ''}`;

            docItem.appendChild(docHeader);
            docItem.appendChild(docFields);

            docItem.addEventListener('click', () => {
                this.addDocumentToSandbox(doc);
            });

            this.documentsContainer.appendChild(docItem);
        });
    }

    addDocumentToSandbox(documentData) {
        const docElement = document.createElement('div');
        docElement.className = 'document-in-sandbox';
        docElement.style.left = `${Math.random() * (this.sandbox.offsetWidth - 300)}px`;
        docElement.style.top = `${Math.random() * (this.sandbox.offsetHeight - 200)}px`;

        const docId = Date.now();
        docElement.dataset.id = docId;

        const header = document.createElement('div');
        header.className = 'document-header-sandbox';

        const logoContainer = document.createElement('div');
        logoContainer.className = 'document-logo';
        const logoIcon = document.createElement('span');
        logoIcon.className = `icon icon-${documentData.icon}`;
        logoIcon.style.fontSize = '1.5em';
        logoContainer.appendChild(logoIcon);

        const title = document.createElement('div');
        title.className = 'document-title';
        title.textContent = documentData.title;
        title.contentEditable = true;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '<span class="icon icon-close"></span>';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            docElement.remove();
            this.documentsInSandbox = this.documentsInSandbox.filter(doc => doc.id !== docId);
        };

        header.appendChild(logoContainer);
        header.appendChild(title);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'document-content';

        documentData.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'document-field';

            const label = document.createElement('span');
            label.className = 'field-label';
            label.textContent = field;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'field-input';
            input.placeholder = `Введите ${field.toLowerCase()}`;

            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            content.appendChild(fieldDiv);
        });

        docElement.appendChild(header);
        docElement.appendChild(content);

        this.sandbox.appendChild(docElement);
        this.documentsInSandbox.push({
            id: docId,
            element: docElement,
            data: documentData
        });

        this.makeDraggable(docElement);
        this.makeResizable(docElement);

        docElement.addEventListener('dblclick', () => {
            this.activeDocument = docId;
            docElement.style.zIndex = '999';
            this.documentsInSandbox.forEach(doc => {
                if (doc.id !== docId) {
                    doc.element.style.zIndex = '200';
                }
            });
        });

        logoContainer.addEventListener('dragover', (e) => e.preventDefault());
        logoContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data.type === 'logo') {
                    logoContainer.innerHTML = `<div style="font-size:1.2em;font-weight:bold;color:#fff;">${data.name.substring(0, 3)}</div>`;
                }
            } catch (err) {
                console.log('Не удалось обработать логотип');
            }
        });
    }

    makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';

            const moveHandler = (e) => {
                if (!isDragging) return;

                const sandboxRect = this.sandbox.getBoundingClientRect();
                let newX = e.clientX - sandboxRect.left - offsetX;
                let newY = e.clientY - sandboxRect.top - offsetY;

                newX = Math.max(0, Math.min(newX, sandboxRect.width - element.offsetWidth));
                newY = Math.max(0, Math.min(newY, sandboxRect.height - element.offsetHeight));

                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            };

            const upHandler = () => {
                isDragging = false;
                element.style.cursor = '';
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        });
    }

    makeResizable(element) {
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            right: 0;
            bottom: 0;
            width: 20px;
            height: 20px;
            cursor: se-resize;
            background: #555;
            border-radius: 4px 0 4px 0;
        `;
        element.appendChild(resizeHandle);

        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            const startWidth = element.offsetWidth;
            const startHeight = element.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;

            const resizeHandler = (e) => {
                if (!isResizing) return;

                const newWidth = Math.max(300, Math.min(600, startWidth + (e.clientX - startX)));
                const newHeight = Math.max(200, Math.min(800, startHeight + (e.clientY - startY)));

                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
            };

            const upHandler = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resizeHandler);
                document.removeEventListener('mouseup', upHandler);
            };

            document.addEventListener('mousemove', resizeHandler);
            document.addEventListener('mouseup', upHandler);
        });
    }

    setupEventListeners() {
        this.sandbox.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.sandbox.addEventListener('drop', (e) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data.type === 'logo' && this.activeDocument) {
                    const activeDoc = this.documentsInSandbox.find(doc => doc.id === this.activeDocument);
                    if (activeDoc) {
                        const logoContainer = activeDoc.element.querySelector('.document-logo');
                        if (logoContainer) {
                            logoContainer.innerHTML = `<div style="font-size:1.2em;font-weight:bold;color:#fff;">${data.name.substring(0, 3)}</div>`;
                        }
                    }
                }
            } catch (err) {
                console.log('Не удалось обработать перетаскивание');
            }
        });
    }
}

function changeLogoSize(factor) {
    if (dossierCreator.contextMenuLogo) {
        const logo = dossierCreator.contextMenuLogo;
        const currentWidth = parseInt(logo.style.width) || 100;
        const newWidth = currentWidth * factor;

        if (newWidth >= 30 && newWidth <= 300) {
            logo.style.width = `${newWidth}px`;
            logo.style.height = `${newWidth}px`;
        }
    }
    dossierCreator.contextMenu.style.display = 'none';
}

function rotateLogo(degrees) {
    if (dossierCreator.contextMenuLogo) {
        const logo = dossierCreator.contextMenuLogo;
        const currentRotation = parseInt(logo.style.transform.replace(/[^-\d]/g, '')) || 0;
        const newRotation = currentRotation + degrees;
        logo.style.transform = `rotate(${newRotation}deg)`;
    }
    dossierCreator.contextMenu.style.display = 'none';
}

function deleteLogo() {
    if (dossierCreator.contextMenuLogo) {
        const logo = dossierCreator.contextMenuLogo;
        logo.remove();
        dossierCreator.backgroundLogos = dossierCreator.backgroundLogos.filter(l => l !== logo);
        dossierCreator.updateLogoCount();
    }
    dossierCreator.contextMenu.style.display = 'none';
}

function clearSandbox() {
    const sandbox = document.getElementById('sandbox');
    sandbox.innerHTML = '';
    dossierCreator.documentsInSandbox = [];
}

function saveDossier() {
    const documents = dossierCreator.documentsInSandbox.map(doc => {
        const fields = {};
        const inputs = doc.element.querySelectorAll('.field-input');
        inputs.forEach(input => {
            const label = input.previousElementSibling.textContent;
            fields[label] = input.value;
        });

        return {
            title: doc.element.querySelector('.document-title').textContent,
            fields: fields
        };
    });

    const data = {
        created: new Date().toISOString(),
        documents: documents
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `dossier_${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    alert('Досье сохранено в JSON файл');
}

function exportDossier() {
    const canvas = document.createElement('canvas');
    const sandbox = document.getElementById('sandbox');
    canvas.width = sandbox.offsetWidth;
    canvas.height = sandbox.offsetHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    dossierCreator.documentsInSandbox.forEach(doc => {
        const rect = doc.element.getBoundingClientRect();
        const sandboxRect = sandbox.getBoundingClientRect();

        const x = rect.left - sandboxRect.left;
        const y = rect.top - sandboxRect.top;

        ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
        ctx.fillRect(x, y, rect.width, rect.height);

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, rect.width, rect.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(doc.data.title, x + 20, y + 30);

        doc.data.fields.forEach((field, index) => {
            ctx.fillStyle = '#aaa';
            ctx.font = '12px Arial';
            ctx.fillText(field + ':', x + 20, y + 60 + (index * 25));
        });
    });

    const link = document.createElement('a');
    link.download = `dossier_export_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    alert('Досье экспортировано в PNG');
}

let dossierCreator;

document.addEventListener('DOMContentLoaded', () => {
    dossierCreator = new DossierCreator();
});