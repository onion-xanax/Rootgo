class DotBackground {
    constructor() {
        this.container = document.getElementById('dot-container');
        this.dots = [];
        this.spacing = 25;
        this.draggedItem = null;
        this.dragGhost = null;
        this.fields = new Map();
        this.connections = [];
        this.scale = 1;
        this.isConnecting = false;
        this.connectionStartField = null;
        this.tempLine = null;
        this.isDraggingField = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.currentMenu = null;
        this.isMobile = false;
        this.init();
    }

    init() {
        this.checkMobile();
        this.createDots();
        window.addEventListener('resize', () => {
            this.updateDots();
            this.checkMobile();
        });
        this.createInfoPanel();
        this.setupDragAndDrop();
        this.setupZoom();
        this.setupScaleIndicator();
        this.setupGlobalListeners();
        this.createSavePanel();
        this.createMobileControls();
    }

    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
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
        this.updateConnections();
    }

    createInfoPanel() {
        const panel = document.createElement('div');
        panel.className = 'info-panel';
        panel.innerHTML = `
            <h2>📁 Досье #001</h2>
            <div class="section-title">Основные данные</div>
        `;

        const dataSections = [
            {
                title: 'Основные данные',
                items: [
                    { id: 'fio', label: 'ФИО', icon: this.createPersonIcon() },
                    { id: 'alias', label: 'Псевдоним', icon: this.createMaskIcon() },
                    { id: 'birth', label: 'Дата рождения', icon: this.createCalendarIcon() },
                    { id: 'age', label: 'Возраст', icon: this.createNumberIcon() },
                    { id: 'gender', label: 'Пол', icon: this.createGenderIcon() }
                ]
            },
            {
                title: 'Документы',
                items: [
                    { id: 'passport', label: 'Паспорт РФ', icon: this.createPassportIcon() },
                    { id: 'snils', label: 'СНИЛС', icon: this.createDocumentIcon() },
                    { id: 'inn', label: 'ИНН', icon: this.createBuildingIcon() },
                    { id: 'driver', label: 'Водительские права', icon: this.createCarIcon() }
                ]
            },
            {
                title: 'Адреса',
                items: [
                    { id: 'home', label: 'Домашний адрес', icon: this.createHomeIcon() },
                    { id: 'work', label: 'Рабочий адрес', icon: this.createOfficeIcon() },
                    { id: 'reg', label: 'Адрес регистрации', icon: this.createPinIcon() }
                ]
            },
            {
                title: 'Контакты',
                items: [
                    { id: 'phone', label: 'Телефон', icon: this.createPhoneIcon() },
                    { id: 'email', label: 'Email', icon: this.createEmailIcon() },
                    { id: 'telegram', label: 'Telegram', icon: this.createPlaneIcon() },
                    { id: 'vk', label: 'VKontakte', icon: this.createGroupIcon() }
                ]
            },
            {
                title: 'Сеть и технологии',
                items: [
                    { id: 'ip', label: 'IP-адрес', icon: this.createGlobeIcon() },
                    { id: 'mac', label: 'MAC-адрес', icon: this.createLinkIcon() },
                    { id: 'device', label: 'Устройство', icon: this.createComputerIcon() },
                    { id: 'os', label: 'Операционная система', icon: this.createGearIcon() },
                    { id: 'browser', label: 'Браузер', icon: this.createSearchIcon() }
                ]
            },
            {
                title: 'Геолокация',
                items: [
                    { id: 'location', label: 'Город', icon: this.createCityIcon() },
                    { id: 'country', label: 'Страна', icon: this.createMapIcon() },
                    { id: 'coordinates', label: 'Координаты', icon: this.createTargetIcon() },
                    { id: 'timezone', label: 'Часовой пояс', icon: this.createClockIcon() }
                ]
            },
            {
                title: 'Финансы',
                items: [
                    { id: 'bank', label: 'Банковская карта', icon: this.createCardIcon() },
                    { id: 'crypto', label: 'Крипто-кошелек', icon: this.createBitcoinIcon() },
                    { id: 'payment', label: 'Платежные системы', icon: this.createMoneyIcon() }
                ]
            },
            {
                title: 'Дополнительно',
                items: [
                    { id: 'workplace', label: 'Место работы', icon: this.createBriefcaseIcon() },
                    { id: 'education', label: 'Образование', icon: this.createGraduationIcon() },
                    { id: 'hobby', label: 'Хобби/Интересы', icon: this.createPaletteIcon() },
                    { id: 'note', label: 'Заметки', icon: this.createNoteIcon() }
                ]
            }
        ];

        dataSections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'section-title';
            sectionEl.textContent = section.title;
            panel.appendChild(sectionEl);

            section.items.forEach(item => {
                const infoItem = document.createElement('div');
                infoItem.className = 'info-item';
                infoItem.dataset.fieldId = item.id;
                infoItem.dataset.fieldLabel = item.label;
                infoItem.draggable = true;

                const iconContainer = document.createElement('div');
                iconContainer.className = 'icon-container';
                iconContainer.innerHTML = item.icon;
                infoItem.appendChild(iconContainer);

                const infoContent = document.createElement('div');
                infoContent.className = 'info-content';

                const infoLabel = document.createElement('div');
                infoLabel.className = 'info-label';
                infoLabel.textContent = item.label;
                infoContent.appendChild(infoLabel);

                const infoValue = document.createElement('div');
                infoValue.className = 'info-value';
                infoValue.contentEditable = true;
                infoValue.textContent = 'Введите данные';
                infoValue.dataset.fieldId = item.id;
                infoContent.appendChild(infoValue);

                infoItem.appendChild(infoContent);
                panel.appendChild(infoItem);
            });
        });

        document.body.appendChild(panel);
        this.enableEditing();
    }

    createPersonIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#ccc"/><path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="#ccc"/></svg>`; }
    createMaskIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/><path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ccc"/></svg>`; }
    createCalendarIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6h14v2H5V6z" fill="#ccc"/></svg>`; }
    createNumberIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#ccc">123</text></svg>`; }
    createGenderIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#ccc" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="#ccc" stroke-width="2"/></svg>`; }
    createPassportIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="#ccc" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#ccc" stroke-width="1"/></svg>`; }
    createDocumentIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#ccc"/></svg>`; }
    createBuildingIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z" fill="#ccc"/></svg>`; }
    createCarIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#ccc"/></svg>`; }
    createHomeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm6 16h-4v-6h-4v6H6v-9l6-4.5 6 4.5v9z" fill="#ccc"/></svg>`; }
    createOfficeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" fill="#ccc"/></svg>`; }
    createPinIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ccc"/></svg>`; }
    createPhoneIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#ccc"/></svg>`; }
    createEmailIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="#ccc"/></svg>`; }
    createPlaneIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#ccc"/></svg>`; }
    createGroupIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#ccc"/></svg>`; }
    createGlobeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#ccc"/></svg>`; }
    createLinkIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="#ccc"/></svg>`; }
    createComputerIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#ccc"/></svg>`; }
    createGearIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#ccc"/></svg>`; }
    createSearchIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#ccc"/></svg>`; }
    createCityIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" fill="#ccc"/></svg>`; }
    createMapIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill="#ccc"/></svg>`; }
    createTargetIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><circle cx="12" cy="12" r="5" fill="#ccc"/><circle cx="12" cy="12" r="2" fill="#333"/></svg>`; }
    createClockIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#ccc"/></svg>`; }
    createCardIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="#ccc"/></svg>`; }
    createBitcoinIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17.06 11.57c.59-.69.94-1.59.94-2.57 0-1.86-1.27-3.43-3-3.87V3h-2v2h-2V3H9v2H6v2h2v10H6v2h3v2h2v-2h2v2h2v-2c2.21 0 4-1.79 4-4 0-1.45-.78-2.73-1.94-3.43zM10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4V7zm5 10h-5v-4h5c1.1 0 2 .9 2 2s-.9 2-2 2z" fill="#ccc"/></svg>`; }
    createMoneyIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="#ccc"/></svg>`; }
    createBriefcaseIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#ccc"/></svg>`; }
    createGraduationIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#ccc"/></svg>`; }
    createPaletteIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c2.76 0 5-2.24 5-5 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-4c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7z" fill="#ccc"/></svg>`; }
    createNoteIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#ccc"/></svg>`; }

    enableEditing() {
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(element => {
            element.addEventListener('click', () => {
                element.focus();
            });

            element.addEventListener('blur', () => {
                if (element.textContent.trim() === '') {
                    element.textContent = 'Введите данные';
                }
            });

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    element.blur();
                }
            });
        });
    }

    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.info-item')) {
                const infoItem = e.target.closest('.info-item');
                this.draggedItem = infoItem;

                this.dragGhost = document.createElement('div');
                this.dragGhost.className = 'dragged-icon';
                this.dragGhost.innerHTML = infoItem.querySelector('.icon-container').innerHTML;
                document.body.appendChild(this.dragGhost);

                e.dataTransfer.setData('text/plain', infoItem.dataset.fieldId);
                e.dataTransfer.effectAllowed = 'copyMove';

                setTimeout(() => {
                    infoItem.style.opacity = '0.4';
                }, 0);
            }
        });

        document.addEventListener('drag', (e) => {
            if (this.dragGhost) {
                this.dragGhost.style.left = `${e.clientX - 24}px`;
                this.dragGhost.style.top = `${e.clientY - 24}px`;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();

            if (this.draggedItem && !e.target.closest('.info-panel')) {
                const fieldId = this.draggedItem.dataset.fieldId;
                const fieldLabel = this.draggedItem.dataset.fieldLabel;
                const fieldValue = this.draggedItem.querySelector('.info-value').textContent;

                if (fieldValue && fieldValue !== 'Введите данные') {
                    const x = e.clientX / this.scale;
                    const y = e.clientY / this.scale;
                    this.createField(fieldId, fieldLabel, fieldValue, x, y);
                }
            }

            this.cleanupDrag();
        });

        document.addEventListener('dragend', () => {
            this.cleanupDrag();
        });
    }

    cleanupDrag() {
        if (this.draggedItem) {
            this.draggedItem.style.opacity = '';
            this.draggedItem = null;
        }

        if (this.dragGhost) {
            this.dragGhost.remove();
            this.dragGhost = null;
        }
    }

    createField(fieldId, label, value, x, y) {
        if (this.fields.has(fieldId)) {
            const existingField = this.fields.get(fieldId);
            existingField.container.style.left = `${x}px`;
            existingField.container.style.top = `${y}px`;
            existingField.container.style.transform = `scale(${1 / this.scale})`;
            return;
        }

        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container';
        fieldContainer.dataset.fieldId = fieldId;
        fieldContainer.dataset.fieldLabel = label;
        fieldContainer.style.left = `${x}px`;
        fieldContainer.style.top = `${y}px`;
        fieldContainer.style.transform = `scale(${1 / this.scale})`;

        const fieldIcon = document.createElement('div');
        fieldIcon.className = 'field-icon';
        fieldIcon.innerHTML = this.getIconForField(fieldId);

        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';
        fieldHeader.appendChild(fieldIcon);

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = label;
        fieldHeader.appendChild(fieldLabel);

        fieldContainer.appendChild(fieldHeader);

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.textContent = value;
        fieldContainer.appendChild(fieldContent);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'field-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteField(fieldId);
        };
        fieldContainer.appendChild(closeBtn);

        document.body.appendChild(fieldContainer);

        const fieldData = {
            container: fieldContainer,
            icon: fieldIcon,
            content: fieldContent,
            label: fieldLabel
        };

        this.fields.set(fieldId, fieldData);

        this.makeFieldInteractive(fieldContainer, fieldData);
    }

    getIconForField(fieldId) {
        const iconMap = {
            'fio': this.createPersonIcon(),
            'alias': this.createMaskIcon(),
            'birth': this.createCalendarIcon(),
            'age': this.createNumberIcon(),
            'gender': this.createGenderIcon(),
            'passport': this.createPassportIcon(),
            'snils': this.createDocumentIcon(),
            'inn': this.createBuildingIcon(),
            'driver': this.createCarIcon(),
            'home': this.createHomeIcon(),
            'work': this.createOfficeIcon(),
            'reg': this.createPinIcon(),
            'phone': this.createPhoneIcon(),
            'email': this.createEmailIcon(),
            'telegram': this.createPlaneIcon(),
            'vk': this.createGroupIcon(),
            'ip': this.createGlobeIcon(),
            'mac': this.createLinkIcon(),
            'device': this.createComputerIcon(),
            'os': this.createGearIcon(),
            'browser': this.createSearchIcon(),
            'location': this.createCityIcon(),
            'country': this.createMapIcon(),
            'coordinates': this.createTargetIcon(),
            'timezone': this.createClockIcon(),
            'bank': this.createCardIcon(),
            'crypto': this.createBitcoinIcon(),
            'payment': this.createMoneyIcon(),
            'workplace': this.createBriefcaseIcon(),
            'education': this.createGraduationIcon(),
            'hobby': this.createPaletteIcon(),
            'note': this.createNoteIcon()
        };
        return iconMap[fieldId] || this.createNoteIcon();
    }

    makeFieldInteractive(fieldContainer, fieldData) {
        let isDragging = false;

        fieldContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                e.stopPropagation();

                if (e.target.classList.contains('field-close-btn')) {
                    return;
                }

                const rect = fieldContainer.getBoundingClientRect();
                this.dragOffsetX = e.clientX - rect.left;
                this.dragOffsetY = e.clientY - rect.top;

                this.startDragging(fieldContainer);
            }
        });

        fieldContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                e.stopPropagation();

                const touch = e.touches[0];
                const rect = fieldContainer.getBoundingClientRect();
                this.dragOffsetX = touch.clientX - rect.left;
                this.dragOffsetY = touch.clientY - rect.top;

                this.startDragging(fieldContainer);
            }
        }, { passive: false });

        fieldContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showFieldMenu(fieldContainer, fieldData, e.clientX, e.clientY);
        });

        fieldContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.showFieldMenu(fieldContainer, fieldData, e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });
    }

    startDragging(fieldContainer) {
        this.hideCurrentMenu();
        this.isDraggingField = true;
        fieldContainer.classList.add('dragging');

        const moveHandler = (e) => {
            if (!this.isDraggingField) return;

            let clientX, clientY;
            if (e.type === 'mousemove') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (e.type === 'touchmove' && e.touches.length === 1) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
                e.preventDefault();
            } else {
                return;
            }

            const x = clientX - this.dragOffsetX;
            const y = clientY - this.dragOffsetY;

            fieldContainer.style.left = `${x}px`;
            fieldContainer.style.top = `${y}px`;
            this.updateConnections();
        };

        const upHandler = () => {
            this.isDraggingField = false;
            fieldContainer.classList.remove('dragging');
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.removeEventListener('touchend', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('mouseup', upHandler);
        document.addEventListener('touchend', upHandler);
    }

    showFieldMenu(fieldContainer, fieldData, x, y) {
        this.hideCurrentMenu();

        const menu = document.createElement('div');
        menu.className = 'field-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const connectItem = document.createElement('div');
        connectItem.className = 'field-menu-item';
        connectItem.innerHTML = '<span class="menu-icon">🔗</span>Протянуть стрелку';
        connectItem.onclick = (e) => {
            e.stopPropagation();
            this.startConnectionMode(fieldContainer);
            this.hideCurrentMenu();
        };
        menu.appendChild(connectItem);

        const editItem = document.createElement('div');
        editItem.className = 'field-menu-item';
        editItem.innerHTML = '<span class="menu-icon">✏️</span>Изменить данные';
        editItem.onclick = (e) => {
            e.stopPropagation();
            this.editFieldData(fieldContainer, fieldData);
            this.hideCurrentMenu();
        };
        menu.appendChild(editItem);

        const changeIconItem = document.createElement('div');
        changeIconItem.className = 'field-menu-item';
        changeIconItem.innerHTML = '<span class="menu-icon">🖼️</span>Поменять иконку';
        changeIconItem.onclick = (e) => {
            e.stopPropagation();
            this.changeFieldIcon(fieldContainer, fieldData);
            this.hideCurrentMenu();
        };
        menu.appendChild(changeIconItem);

        const deleteItem = document.createElement('div');
        deleteItem.className = 'field-menu-item delete';
        deleteItem.innerHTML = '<span class="menu-icon">🗑️</span>Удалить блок';
        deleteItem.onclick = (e) => {
            e.stopPropagation();
            this.deleteField(fieldContainer.dataset.fieldId);
            this.hideCurrentMenu();
        };
        menu.appendChild(deleteItem);

        document.body.appendChild(menu);
        this.currentMenu = menu;

        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== fieldContainer) {
                this.hideCurrentMenu();
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('touchstart', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('touchstart', closeMenu, { passive: false });
        }, 10);
    }

    hideCurrentMenu() {
        if (this.currentMenu) {
            this.currentMenu.remove();
            this.currentMenu = null;
        }
    }

    startConnectionMode(fieldContainer) {
        if (this.isConnecting) {
            this.cancelConnection();
            return;
        }

        this.isConnecting = true;
        this.connectionStartField = fieldContainer;

        this.tempLine = document.createElement('div');
        this.tempLine.className = 'connection-line';
        document.body.appendChild(this.tempLine);

        const moveHandler = (e) => {
            if (!this.tempLine || !this.connectionStartField) return;

            const fromRect = this.connectionStartField.getBoundingClientRect();
            const fromX = fromRect.left + fromRect.width / 2;
            const fromY = fromRect.top + fromRect.height / 2;
            let toX, toY;

            if (e.type === 'mousemove') {
                toX = e.clientX;
                toY = e.clientY;
            } else if (e.type === 'touchmove' && e.touches.length === 1) {
                toX = e.touches[0].clientX;
                toY = e.touches[0].clientY;
                e.preventDefault();
            } else {
                return;
            }

            this.drawCurvedLine(fromX, fromY, toX, toY, this.tempLine, true);
        };

        const clickHandler = (e) => {
            const clickedField = e.target.closest('.field-container');
            if (clickedField && clickedField !== this.connectionStartField) {
                this.createConnection(
                    this.connectionStartField.dataset.fieldId,
                    clickedField.dataset.fieldId
                );
                this.cancelConnection();
            } else if (!clickedField) {
                this.cancelConnection();
            }
        };

        const touchHandler = (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const clickedElement = document.elementFromPoint(touch.clientX, touch.clientY);
                const clickedField = clickedElement.closest('.field-container');

                if (clickedField && clickedField !== this.connectionStartField) {
                    this.createConnection(
                        this.connectionStartField.dataset.fieldId,
                        clickedField.dataset.fieldId
                    );
                    this.cancelConnection();
                } else if (!clickedField) {
                    this.cancelConnection();
                }
            }
        };

        const cancelHandler = (e) => {
            if (e.key === 'Escape' || e.button === 2) {
                e.preventDefault();
                this.cancelConnection();
            }
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('click', clickHandler);
        document.addEventListener('touchend', touchHandler);
        document.addEventListener('contextmenu', cancelHandler);
        document.addEventListener('keydown', cancelHandler);

        this.tempLine.handlers = { moveHandler, clickHandler, touchHandler, cancelHandler };
    }

    editFieldData(fieldContainer, fieldData) {
        if (!fieldData) return;

        fieldData.content.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = fieldData.content.textContent;
        input.style.display = 'block';
        input.style.marginTop = '10px';

        fieldContainer.insertBefore(input, fieldData.content.nextSibling);
        input.focus();
        input.select();

        const saveEdit = () => {
            fieldData.content.textContent = input.value || 'Введите данные';
            fieldData.content.style.display = 'block';
            input.remove();
            document.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('touchstart', outsideClickHandler);
            document.removeEventListener('keydown', keydownHandler);
        };

        const cancelEdit = () => {
            fieldData.content.style.display = 'block';
            input.remove();
            document.removeEventListener('click', outsideClickHandler);
            document.removeEventListener('touchstart', outsideClickHandler);
            document.removeEventListener('keydown', keydownHandler);
        };

        const outsideClickHandler = (e) => {
            if (!fieldContainer.contains(e.target)) {
                saveEdit();
            }
        };

        const keydownHandler = (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        };

        document.addEventListener('click', outsideClickHandler);
        document.addEventListener('touchstart', outsideClickHandler, { passive: false });
        document.addEventListener('keydown', keydownHandler);
    }

    changeFieldIcon(fieldContainer, fieldData) {
        if (!fieldData) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/jpeg,image/png,image/jpg';
        fileInput.className = 'file-input';

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fieldData.icon.innerHTML = '';
                    const img = document.createElement('img');
                    img.className = 'custom-icon-img';
                    img.src = event.target.result;
                    fieldData.icon.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
            fileInput.remove();
        };

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    deleteField(fieldId) {
        const field = this.fields.get(fieldId);
        if (field) {
            field.container.remove();
            this.fields.delete(fieldId);

            this.connections = this.connections.filter(conn =>
                conn.from !== fieldId && conn.to !== fieldId
            );
            this.updateConnections();
            this.hideCurrentMenu();
        }
    }

    cancelConnection() {
        this.isConnecting = false;
        this.connectionStartField = null;
        if (this.tempLine) {
            if (this.tempLine.handlers) {
                document.removeEventListener('mousemove', this.tempLine.handlers.moveHandler);
                document.removeEventListener('touchmove', this.tempLine.handlers.moveHandler);
                document.removeEventListener('click', this.tempLine.handlers.clickHandler);
                document.removeEventListener('touchend', this.tempLine.handlers.touchHandler);
                document.removeEventListener('contextmenu', this.tempLine.handlers.cancelHandler);
                document.removeEventListener('keydown', this.tempLine.handlers.cancelHandler);
            }
            this.tempLine.remove();
            this.tempLine = null;
        }
    }

    createConnection(fromId, toId) {
        const connectionId = `${fromId}_${toId}`;

        if (this.connections.some(conn => conn.id === connectionId)) {
            return;
        }

        this.connections.push({
            id: connectionId,
            from: fromId,
            to: toId
        });

        this.updateConnections();
    }

    drawCurvedLine(x1, y1, x2, y2, container, isTemp = false) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const offset = Math.min(dist / 3, 100);
        const controlX1 = x1 + dx * 0.3;
        const controlY1 = y1 + offset;
        const controlX2 = x2 - dx * 0.3;
        const controlY2 = y2 - offset;

        const pathData = `
            M ${x1} ${y1}
            C ${controlX1} ${controlY1},
              ${controlX2} ${controlY2},
              ${x2} ${y2}
        `;

        container.innerHTML = `
            <svg width="${window.innerWidth}" height="${window.innerHeight}" style="position:absolute;left:0;top:0;">
                <path d="${pathData}" 
                      fill="none" 
                      stroke="${isTemp ? '#666' : '#888'}" 
                      stroke-width="2" 
                      stroke-dasharray="${isTemp ? '5,5' : 'none'}"
                      opacity="${isTemp ? '0.7' : '0.6'}"/>
                ${!isTemp ? `
                <polygon points="0,0 -6,-10 6,-10" 
                         class="connection-arrow"
                         transform="translate(${x2},${y2}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})"/>
                ` : ''}
            </svg>
        `;
    }

    updateConnections() {
        document.querySelectorAll('.connection-line:not(.temp)').forEach(line => line.remove());

        this.connections.forEach(connection => {
            const fromField = this.fields.get(connection.from);
            const toField = this.fields.get(connection.to);

            if (fromField && toField) {
                const fromRect = fromField.container.getBoundingClientRect();
                const toRect = toField.container.getBoundingClientRect();

                const fromX = fromRect.left + fromRect.width / 2;
                const fromY = fromRect.top + fromRect.height / 2;
                const toX = toRect.left + toRect.width / 2;
                const toY = toRect.top + toRect.height / 2;

                const line = document.createElement('div');
                line.className = 'connection-line';
                document.body.appendChild(line);

                this.drawCurvedLine(fromX, fromY, toX, toY, line);
            }
        });
    }

    setupZoom() {
        const minScale = 0.3;
        const maxScale = 3;

        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();

                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newScale = Math.max(minScale, Math.min(maxScale, this.scale * delta));

                if (newScale !== this.scale) {
                    const rect = document.body.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const scaleChange = newScale / this.scale;
                    const newX = mouseX - (mouseX * scaleChange);
                    const newY = mouseY - (mouseY * scaleChange);

                    this.scale = newScale;

                    document.body.style.transform = `scale(${this.scale}) translate(${newX}px, ${newY}px)`;

                    this.fields.forEach(fieldData => {
                        fieldData.container.style.transform = `scale(${1 / this.scale})`;
                    });

                    this.updateScaleIndicator();
                    this.updateConnections();
                }
            }
        }, { passive: false });
    }

    zoomIn() {
        const minScale = 0.3;
        const maxScale = 3;
        const newScale = Math.min(maxScale, this.scale * 1.2);

        if (newScale !== this.scale) {
            this.scale = newScale;

            document.body.style.transform = `scale(${this.scale})`;

            this.fields.forEach(fieldData => {
                fieldData.container.style.transform = `scale(${1 / this.scale})`;
            });

            this.updateScaleIndicator();
            this.updateConnections();
        }
    }

    zoomOut() {
        const minScale = 0.3;
        const maxScale = 3;
        const newScale = Math.max(minScale, this.scale * 0.8);

        if (newScale !== this.scale) {
            this.scale = newScale;

            document.body.style.transform = `scale(${this.scale})`;

            this.fields.forEach(fieldData => {
                fieldData.container.style.transform = `scale(${1 / this.scale})`;
            });

            this.updateScaleIndicator();
            this.updateConnections();
        }
    }

    setupScaleIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scale-indicator';
        indicator.textContent = `Масштаб: ${Math.round(this.scale * 100)}%`;
        document.body.appendChild(indicator);
        this.scaleIndicator = indicator;
    }

    updateScaleIndicator() {
        if (this.scaleIndicator) {
            this.scaleIndicator.textContent = `Масштаб: ${Math.round(this.scale * 100)}%`;
        }
    }

    createSavePanel() {
        const savePanel = document.createElement('div');
        savePanel.className = 'save-panel';

        const saveJpgBtn = document.createElement('button');
        saveJpgBtn.className = 'save-btn';
        saveJpgBtn.textContent = 'Сохранить JPG';
        saveJpgBtn.onclick = () => this.saveAsImage('jpg');

        const savePngBtn = document.createElement('button');
        savePngBtn.className = 'save-btn';
        savePngBtn.textContent = 'Сохранить PNG';
        savePngBtn.onclick = () => this.saveAsImage('png');

        const saveHtmlBtn = document.createElement('button');
        saveHtmlBtn.className = 'save-btn';
        saveHtmlBtn.textContent = 'Сохранить HTML';
        saveHtmlBtn.onclick = () => this.saveAsHTML();

        savePanel.appendChild(saveJpgBtn);
        savePanel.appendChild(savePngBtn);
        savePanel.appendChild(saveHtmlBtn);

        document.body.appendChild(savePanel);
    }

    createMobileControls() {
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';

        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-btn';
        menuBtn.innerHTML = '☰';
        menuBtn.onclick = () => {
            document.querySelector('.info-panel').classList.toggle('active');
        };

        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'zoom-btn';
        zoomInBtn.innerHTML = '+';
        zoomInBtn.onclick = () => this.zoomIn();

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'zoom-btn';
        zoomOutBtn.innerHTML = '-';
        zoomOutBtn.onclick = () => this.zoomOut();

        zoomControls.appendChild(zoomInBtn);
        zoomControls.appendChild(zoomOutBtn);

        mobileControls.appendChild(menuBtn);

        document.body.appendChild(mobileControls);
        document.body.appendChild(zoomControls);
    }

    saveAsImage(format) {
        const elementsToCapture = [this.container];

        this.fields.forEach(fieldData => {
            elementsToCapture.push(fieldData.container);
        });

        this.connections.forEach(connection => {
            const fromField = this.fields.get(connection.from);
            const toField = this.fields.get(connection.to);
            if (fromField && toField) {
                const line = document.createElement('div');
                line.className = 'connection-line';
                const fromRect = fromField.container.getBoundingClientRect();
                const toRect = toField.container.getBoundingClientRect();
                this.drawCurvedLine(
                    fromRect.left + fromRect.width / 2,
                    fromRect.top + fromRect.height / 2,
                    toRect.left + toRect.width / 2,
                    toRect.top + toRect.height / 2,
                    line
                );
                elementsToCapture.push(line);
            }
        });

        const boundingBox = this.calculateBoundingBox(elementsToCapture);

        const canvas = document.createElement('canvas');
        canvas.width = boundingBox.width;
        canvas.height = boundingBox.height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const dotsCanvas = document.createElement('canvas');
        dotsCanvas.width = window.innerWidth;
        dotsCanvas.height = window.innerHeight;
        const dotsCtx = dotsCanvas.getContext('2d');

        dotsCtx.fillStyle = 'black';
        dotsCtx.fillRect(0, 0, dotsCanvas.width, dotsCanvas.height);

        const dots = document.querySelectorAll('.dot');
        dots.forEach(dot => {
            const rect = dot.getBoundingClientRect();
            dotsCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            dotsCtx.beginPath();
            dotsCtx.arc(rect.left, rect.top, 0.5, 0, Math.PI * 2);
            dotsCtx.fill();
        });

        ctx.drawImage(dotsCanvas, boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, 0, boundingBox.width, boundingBox.height);

        elementsToCapture.forEach(element => {
            if (element === this.container) return;

            const rect = element.getBoundingClientRect();
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            const tempCtx = tempCanvas.getContext('2d');

            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const borderColor = style.borderColor;
            const borderRadius = parseInt(style.borderRadius);
            const borderWidth = parseInt(style.borderWidth);

            tempCtx.fillStyle = bgColor;

            if (borderRadius > 0) {
                tempCtx.beginPath();
                tempCtx.moveTo(borderRadius, 0);
                tempCtx.lineTo(rect.width - borderRadius, 0);
                tempCtx.quadraticCurveTo(rect.width, 0, rect.width, borderRadius);
                tempCtx.lineTo(rect.width, rect.height - borderRadius);
                tempCtx.quadraticCurveTo(rect.width, rect.height, rect.width - borderRadius, rect.height);
                tempCtx.lineTo(borderRadius, rect.height);
                tempCtx.quadraticCurveTo(0, rect.height, 0, rect.height - borderRadius);
                tempCtx.lineTo(0, borderRadius);
                tempCtx.quadraticCurveTo(0, 0, borderRadius, 0);
                tempCtx.closePath();
                tempCtx.fill();

                if (borderWidth > 0) {
                    tempCtx.strokeStyle = borderColor;
                    tempCtx.lineWidth = borderWidth;
                    tempCtx.stroke();
                }
            } else {
                tempCtx.fillRect(0, 0, rect.width, rect.height);
                if (borderWidth > 0) {
                    tempCtx.strokeStyle = borderColor;
                    tempCtx.lineWidth = borderWidth;
                    tempCtx.strokeRect(0, 0, rect.width, rect.height);
                }
            }

            if (element.querySelector('.field-content')) {
                const content = element.querySelector('.field-content');
                const label = element.querySelector('.field-label');

                tempCtx.fillStyle = '#aaa';
                tempCtx.font = '12px Arial';
                tempCtx.fillText(label.textContent, 10, 20);

                tempCtx.fillStyle = '#fff';
                tempCtx.font = '14px Arial';
                const lines = this.wrapText(content.textContent, rect.width - 20, tempCtx);
                lines.forEach((line, i) => {
                    tempCtx.fillText(line, 10, 40 + (i * 18));
                });
            }

            ctx.drawImage(
                tempCanvas,
                0, 0, rect.width, rect.height,
                rect.left - boundingBox.left, rect.top - boundingBox.top,
                rect.width, rect.height
            );
        });

        const link = document.createElement('a');
        link.download = `dossier.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();

        elementsToCapture.forEach(element => {
            if (element.classList && element.classList.contains('connection-line')) {
                element.remove();
            }
        });
    }

    calculateBoundingBox(elements) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        elements.forEach(element => {
            if (element === this.container) {
                minX = 0;
                minY = 0;
                maxX = window.innerWidth;
                maxY = window.innerHeight;
                return;
            }

            const rect = element.getBoundingClientRect();
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        });

        const padding = 20;
        return {
            left: Math.max(0, minX - padding),
            top: Math.max(0, minY - padding),
            width: Math.min(window.innerWidth, maxX - minX + (padding * 2)),
            height: Math.min(window.innerHeight, maxY - minY + (padding * 2))
        };
    }

    wrapText(text, maxWidth, context) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    saveAsHTML() {
        const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Досье - Экспорт</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #0a0a0a;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .export-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            color: white;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .fields-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .field-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            color: white;
        }
        .field-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        }
        .field-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #2a2a2a;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            border: 2px solid #444;
        }
        .field-label {
            font-size: 14px;
            color: #888;
            margin-bottom: 5px;
        }
        .field-value {
            font-size: 16px;
            color: white;
        }
        .connections {
            margin-top: 40px;
            color: white;
        }
        .connection-item {
            background: #1a1a1a;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #666;
        }
    </style>
</head>
<body>
    <div class="export-container">
        <div class="header">
            <h1>📁 Досье OSINT - Экспорт</h1>
            <p>Дата экспорта: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="fields-grid">
            ${Array.from(this.fields.entries()).map(([id, fieldData]) => `
                <div class="field-card">
                    <div class="field-header">
                        <div class="field-icon">${fieldData.icon.innerHTML}</div>
                        <div>
                            <div class="field-label">${fieldData.label.textContent}</div>
                            <div class="field-value">${fieldData.content.textContent}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${this.connections.length > 0 ? `
        <div class="connections">
            <h2>Связи между блоками</h2>
            ${this.connections.map(conn => {
            const fromField = this.fields.get(conn.from);
            const toField = this.fields.get(conn.to);
            return `
                    <div class="connection-item">
                        ${fromField ? fromField.label.textContent : 'Удаленный блок'} → ${toField ? toField.label.textContent : 'Удаленный блок'}
                    </div>
                `;
        }).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.download = 'dossier_export.html';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    setupGlobalListeners() {
        document.addEventListener('contextmenu', (e) => {
            if (!e.target.closest('.field-container')) {
                e.preventDefault();
                this.hideCurrentMenu();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.field-menu') && !e.target.closest('.field-container')) {
                this.hideCurrentMenu();
            }
        });

        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.field-menu') && !e.target.closest('.field-container')) {
                this.hideCurrentMenu();
            }
        }, { passive: false });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DotBackground();
});