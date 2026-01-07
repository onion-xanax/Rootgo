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
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.containerLeft = 0;
        this.containerTop = 0;
        this.dotContainerScale = 1;
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
        this.createLinkBlocks();
        this.setupPanning();
    }

    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
    }

    createDots() {
        const containerWidth = 5000;
        const containerHeight = 5000;
        const cols = Math.floor(containerWidth / this.spacing) + 1;
        const rows = Math.floor(containerHeight / this.spacing) + 1;

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

    createLinkBlocks() {
        const linksContainer = document.createElement('div');
        linksContainer.className = 'links-container';
        linksContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        `;

        const osintTools = this.createToolField('osint_tools', '🔍 OSINT Tools');
        const pentestTools = this.createToolField('pentest_tools', '⚡ Pentest Tools');
        const serenityAI = this.createSerenityAIButton();
        const constructorBtn = this.createConstructorButton();
        const telegramBlock = this.createLinkField('telegram_link', 'Telegram', 't.me/root_sql', this.createTelegramLinkIcon());
        const channelBlock = this.createLinkField('channel_link', 'Channel', 'https://t.me/+6VyEXR4L7eRjN2Q1', this.createChannelLinkIcon());

        linksContainer.appendChild(osintTools);
        linksContainer.appendChild(pentestTools);
        linksContainer.appendChild(serenityAI);
        linksContainer.appendChild(constructorBtn);
        linksContainer.appendChild(telegramBlock);
        linksContainer.appendChild(channelBlock);
        document.body.appendChild(linksContainer);
    }

    createToolField(id, label) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container tool-field';
        fieldContainer.dataset.fieldId = id;
        fieldContainer.dataset.fieldLabel = label;
        fieldContainer.style.cssText = `
            position: relative;
            min-width: 250px;
            background: rgba(20, 20, 30, 0.95);
            border: 2px solid #4a4a6a;
            border-radius: 10px;
            padding: 15px;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            cursor: pointer;
            transform-origin: center;
            transition: all 0.3s ease;
        `;

        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';

        const fieldIcon = document.createElement('div');
        fieldIcon.className = 'field-icon';
        fieldIcon.innerHTML = this.createToolsIcon();

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = label;
        fieldLabel.style.cssText = `
            color: #00bcd4;
            font-weight: bold;
            font-size: 14px;
        `;

        fieldHeader.appendChild(fieldIcon);
        fieldHeader.appendChild(fieldLabel);
        fieldContainer.appendChild(fieldHeader);

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.textContent = id === 'osint_tools' ? 'Инструменты для OSINT-разведки' : 'Инструменты для пентеста';
        fieldContent.style.cssText = `
            color: #fff;
            margin-top: 10px;
            font-size: 13px;
        `;
        fieldContainer.appendChild(fieldContent);

        fieldContainer.addEventListener('click', () => {
            const url = id === 'osint_tools' ? 'osint' : 'pentest';
            window.location.href = url;
        });

        fieldContainer.addEventListener('mouseenter', () => {
            fieldContainer.style.transform = 'translateY(-2px)';
            fieldContainer.style.boxShadow = '0 6px 25px rgba(0, 188, 212, 0.4)';
        });

        fieldContainer.addEventListener('mouseleave', () => {
            fieldContainer.style.transform = 'translateY(0)';
            fieldContainer.style.boxShadow = '0 4px 20px rgba(0, 188, 212, 0.3)';
        });

        return fieldContainer;
    }

    createSerenityAIButton() {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container serenity-btn';
        fieldContainer.style.cssText = `
            position: relative;
            min-width: 200px;
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(233, 30, 99, 0.2));
            border: 2px solid #9c27b0;
            border-radius: 10px;
            padding: 15px;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(156, 39, 176, 0.3);
            backdrop-filter: blur(5px);
            cursor: pointer;
            transform-origin: center;
            transition: all 0.3s ease;
        `;

        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';

        const fieldIcon = document.createElement('div');
        fieldIcon.className = 'field-icon';
        fieldIcon.innerHTML = this.createAIicon();

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = '🤖 Serenity AI';
        fieldLabel.style.cssText = `
            color: #9c27b0;
            font-weight: bold;
            font-size: 14px;
        `;

        fieldHeader.appendChild(fieldIcon);
        fieldHeader.appendChild(fieldLabel);
        fieldContainer.appendChild(fieldHeader);

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.textContent = 'Искусственный интеллект для анализа данных';
        fieldContent.style.cssText = `
            color: #fff;
            margin-top: 10px;
            font-size: 13px;
        `;
        fieldContainer.appendChild(fieldContent);

        fieldContainer.addEventListener('click', () => {
            window.location.href = 'serenity';
        });

        fieldContainer.addEventListener('mouseenter', () => {
            fieldContainer.style.transform = 'translateY(-2px)';
            fieldContainer.style.boxShadow = '0 6px 25px rgba(156, 39, 176, 0.4)';
        });

        fieldContainer.addEventListener('mouseleave', () => {
            fieldContainer.style.transform = 'translateY(0)';
            fieldContainer.style.boxShadow = '0 4px 20px rgba(156, 39, 176, 0.3)';
        });

        return fieldContainer;
    }

    createAIicon() {
        return `<svg class="icon-svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="#ccc"/>
            <path d="M16.59 7.58L10 14.17l-2.59-2.58L6 13l4 4 8-8z" fill="#9c27b0"/>
        </svg>`;
    }

    createToolsIcon() {
        return `<svg class="icon-svg" viewBox="0 0 24 24">
            <path d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39zM11 18a7 7 0 1 1 7-7 7 7 0 0 1-7 7z" fill="#ccc"/>
        </svg>`;
    }

    createToolsList(type) {
        const toolsList = document.createElement('div');
        toolsList.className = 'tools-list';
        toolsList.style.cssText = `
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
        `;

        const tools = type === 'osint' ? [
            { name: 'Shodan', type: 'Поиск устройств' },
            { name: 'Maltego', type: 'Анализ связей' },
            { name: 'theHarvester', type: 'Сбор email' },
            { name: 'Recon-ng', type: 'Реконна' },
            { name: 'SpiderFoot', type: 'Автоматизация' }
        ] : [
            { name: 'Metasploit', type: 'Эксплойт-фреймворк' },
            { name: 'Nmap', type: 'Сканирование сети' },
            { name: 'Burp Suite', type: 'Веб-тестирование' },
            { name: 'John the Ripper', type: 'Взлом паролей' },
            { name: 'Wireshark', type: 'Анализ трафика' }
        ];

        tools.forEach(tool => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.style.cssText = `
                display: flex;
                align-items: center;
                padding: 8px;
                margin-bottom: 5px;
                background: rgba(40, 40, 60, 0.6);
                border-radius: 6px;
                border-left: 3px solid #00bcd4;
                cursor: pointer;
                transition: all 0.2s;
            `;

            toolItem.innerHTML = `
                <div style="font-size: 1.2em; margin-right: 10px;">${type === 'osint' ? '🔍' : '⚡'}</div>
                <div style="flex-grow: 1;">
                    <div style="color: #fff; font-size: 13px;">${tool.name}</div>
                    <div style="color: #aaa; font-size: 11px;">${tool.type}</div>
                </div>
            `;

            toolItem.onclick = (e) => {
                e.stopPropagation();
                this.showToolInfo(tool);
            };

            toolsList.appendChild(toolItem);
        });

        return toolsList;
    }

    showToolInfo(tool) {
        this.hideCurrentMenu();

        const infoWindow = document.createElement('div');
        infoWindow.className = 'field-menu';
        infoWindow.style.cssText = `
            position: fixed;
            background: rgba(30, 30, 50, 0.98);
            border: 2px solid #4a4a6a;
            border-radius: 10px;
            padding: 15px;
            z-index: 1001;
            backdrop-filter: blur(10px);
            min-width: 300px;
            max-width: 400px;
        `;

        infoWindow.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="font-size: 2em; margin-right: 15px;">${tool.name === 'Shodan' ? '🔍' : '⚡'}</div>
                <div>
                    <div style="color: #fff; font-size: 18px; font-weight: bold;">${tool.name}</div>
                    <div style="color: #00bcd4; font-size: 14px;">${tool.type}</div>
                </div>
            </div>
            <div style="color: #ccc; font-size: 13px; line-height: 1.5;">
                <p><strong>Назначение:</strong> Инструмент для проведения ${tool.name.includes('Shodan') || tool.name.includes('Maltego') ? 'OSINT' : 'Pentest'}-разведки.</p>
                <p><strong>Использование:</strong> Добавьте этот инструмент в ваше досье для анализа данных.</p>
            </div>
            <button class="control-btn" style="margin-top: 15px; width: 100%; padding: 10px; background: #4a4a6a; border: none; border-radius: 6px; color: #fff; cursor: pointer;">
                Добавить в досье
            </button>
        `;

        const rect = document.querySelector('.tool-field').getBoundingClientRect();
        infoWindow.style.left = `${rect.left}px`;
        infoWindow.style.top = `${rect.bottom + 10}px`;

        document.body.appendChild(infoWindow);
        this.currentMenu = infoWindow;

        const closeMenu = (e) => {
            if (!infoWindow.contains(e.target) && !e.target.closest('.tool-field')) {
                infoWindow.remove();
                this.currentMenu = null;
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }

    createConstructorButton() {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container constructor-btn';
        fieldContainer.style.cssText = `
            position: relative;
            min-width: 200px;
            background: linear-gradient(135deg, rgba(0, 188, 212, 0.2), rgba(156, 39, 176, 0.2));
            border: 2px solid #00bcd4;
            border-radius: 10px;
            padding: 15px;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(0, 188, 212, 0.3);
            backdrop-filter: blur(5px);
            cursor: pointer;
            transform-origin: center;
            transition: all 0.3s ease;
        `;

        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';

        const fieldIcon = document.createElement('div');
        fieldIcon.className = 'field-icon';
        fieldIcon.innerHTML = this.createConstructorIcon();

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = '📁 Great Dossier';
        fieldLabel.style.cssText = `
            color: #00bcd4;
            font-weight: bold;
            font-size: 14px;
        `;

        fieldHeader.appendChild(fieldIcon);
        fieldHeader.appendChild(fieldLabel);
        fieldContainer.appendChild(fieldHeader);

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.textContent = 'Открыть конструктор документов';
        fieldContent.style.cssText = `
            color: #fff;
            margin-top: 10px;
            font-size: 13px;
        `;
        fieldContainer.appendChild(fieldContent);

        fieldContainer.addEventListener('click', () => {
            window.location.href = 'dosier';
        });

        fieldContainer.addEventListener('mouseenter', () => {
            fieldContainer.style.transform = 'translateY(-2px)';
            fieldContainer.style.boxShadow = '0 6px 25px rgba(0, 188, 212, 0.4)';
        });

        fieldContainer.addEventListener('mouseleave', () => {
            fieldContainer.style.transform = 'translateY(0)';
            fieldContainer.style.boxShadow = '0 4px 20px rgba(0, 188, 212, 0.3)';
        });

        return fieldContainer;
    }

    createConstructorIcon() {
        return `<svg class="icon-svg" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#ccc"/>
        </svg>`;
    }

    createLinkField(id, label, value, icon) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container link-field';
        fieldContainer.dataset.fieldId = id;
        fieldContainer.dataset.fieldLabel = label;
        fieldContainer.style.cssText = `
            position: relative;
            min-width: 200px;
            background: rgba(34, 34, 34, 0.95);
            border: 2px solid #666;
            border-radius: 10px;
            padding: 15px;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            cursor: pointer;
            transform-origin: center;
        `;

        const fieldHeader = document.createElement('div');
        fieldHeader.className = 'field-header';

        const fieldIcon = document.createElement('div');
        fieldIcon.className = 'field-icon';
        fieldIcon.innerHTML = icon;

        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'field-label';
        fieldLabel.textContent = label;

        fieldHeader.appendChild(fieldIcon);
        fieldHeader.appendChild(fieldLabel);
        fieldContainer.appendChild(fieldHeader);

        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.textContent = value;
        fieldContent.style.cssText = `
            color: #4fc3f7;
            text-decoration: underline;
            word-break: break-all;
        `;
        fieldContainer.appendChild(fieldContent);

        fieldContainer.addEventListener('click', () => {
            window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
        });

        fieldContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showLinkMenu(fieldContainer, value);
        });

        return fieldContainer;
    }

    createTelegramLinkIcon() {
        return `<svg class="icon-svg" viewBox="0 0 24 24">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" fill="#ccc"/>
        </svg>`;
    }

    createChannelLinkIcon() {
        return `<svg class="icon-svg" viewBox="0 0 24 24">
            <path d="M18 4H6C4.9 4 4 4.9 4 6v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z" fill="#ccc"/>
            <path d="M8 8h8v2H8zm0 4h8v2H8z" fill="#ccc"/>
        </svg>`;
    }

    showLinkMenu(fieldContainer, link) {
        this.hideCurrentMenu();

        const menu = document.createElement('div');
        menu.className = 'field-menu';
        menu.style.cssText = `
            position: fixed;
            background: rgba(40, 40, 40, 0.95);
            border: 1px solid #555;
            border-radius: 6px;
            padding: 8px;
            z-index: 1000;
            backdrop-filter: blur(5px);
            min-width: 200px;
        `;

        const copyItem = document.createElement('div');
        copyItem.className = 'field-menu-item';
        copyItem.innerHTML = '<span class="menu-icon">📋</span>Скопировать ссылку';
        copyItem.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(link);
            this.hideCurrentMenu();
        };

        const openItem = document.createElement('div');
        openItem.className = 'field-menu-item';
        openItem.innerHTML = '<span class="menu-icon">🔗</span>Открыть в новой вкладке';
        openItem.onclick = (e) => {
            e.stopPropagation();
            window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
            this.hideCurrentMenu();
        };

        menu.appendChild(copyItem);
        menu.appendChild(openItem);

        const rect = fieldContainer.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;

        document.body.appendChild(menu);
        this.currentMenu = menu;

        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== fieldContainer) {
                this.hideCurrentMenu();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }

    setupPanning() {
        this.container.style.cursor = 'grab';

        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                this.isPanning = true;
                this.panStartX = e.clientX - this.containerLeft;
                this.panStartY = e.clientY - this.containerTop;
                this.container.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isPanning) return;

            const x = e.clientX - this.panStartX;
            const y = e.clientY - this.panStartY;

            this.containerLeft = x;
            this.containerTop = y;

            this.container.style.transform = `translate(${x}px, ${y}px) scale(${this.dotContainerScale})`;
            this.updateConnections();
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2 && this.isPanning) {
                this.isPanning = false;
                this.container.style.cursor = 'grab';
            }
        });

        document.addEventListener('contextmenu', (e) => {
            if (e.target === this.container || this.container.contains(e.target)) {
                e.preventDefault();
            }
        });
    }

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
                    const x = e.clientX - this.containerLeft;
                    const y = e.clientY - this.containerTop;
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
            return;
        }

        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container';
        fieldContainer.dataset.fieldId = fieldId;
        fieldContainer.dataset.fieldLabel = label;
        fieldContainer.style.left = `${x}px`;
        fieldContainer.style.top = `${y}px`;

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

        this.container.appendChild(fieldContainer);

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
            'nationality': this.createFlagIcon(),
            'occupation': this.createSuitIcon(),
            'religion': this.createChurchIcon(),
            'marital': this.createRingIcon(),
            'children': this.createChildIcon(),
            'passport': this.createPassportIcon(),
            'snils': this.createDocumentIcon(),
            'inn': this.createBuildingIcon(),
            'driver': this.createCarIcon(),
            'foreign_passport': this.createGlobePassportIcon(),
            'military_id': this.createHelmetIcon(),
            'birth_certificate': this.createBabyIcon(),
            'diploma': this.createDiplomaIcon(),
            'visa': this.createStampIcon(),
            'insurance': this.createHealthIcon(),
            'home': this.createHomeIcon(),
            'work': this.createOfficeIcon(),
            'reg': this.createPinIcon(),
            'birth_place': this.createHospitalIcon(),
            'previous_address': this.createHistoryIcon(),
            'property': this.createBuilding2Icon(),
            'land': this.createTreeIcon(),
            'garage': this.createGarageIcon(),
            'postal': this.createMailboxIcon(),
            'legal_address': this.createBalanceIcon(),
            'phone': this.createPhoneIcon(),
            'email': this.createEmailIcon(),
            'telegram': this.createPlaneIcon(),
            'vk': this.createGroupIcon(),
            'whatsapp': this.createWhatsappIcon(),
            'skype': this.createSkypeIcon(),
            'instagram': this.createInstagramIcon(),
            'facebook': this.createFacebookIcon(),
            'twitter': this.createTwitterIcon(),
            'linkedin': this.createLinkedinIcon(),
            'ip': this.createGlobeIcon(),
            'mac': this.createLinkIcon(),
            'device': this.createComputerIcon(),
            'os': this.createGearIcon(),
            'browser': this.createSearchIcon(),
            'router': this.createRouterIcon(),
            'wifi': this.createWifiIcon(),
            'domain': this.createDomainIcon(),
            'hosting': this.createServerIcon(),
            'vpn': this.createShieldIcon(),
            'location': this.createCityIcon(),
            'country': this.createMapIcon(),
            'coordinates': this.createTargetIcon(),
            'timezone': this.createClockIcon(),
            'latitude': this.createLatitudeIcon(),
            'longitude': this.createLongitudeIcon(),
            'altitude': this.createMountainIcon(),
            'speed': this.createSpeedIcon(),
            'accuracy': this.createTarget2Icon(),
            'last_seen': this.createEyeIcon(),
            'bank': this.createCardIcon(),
            'crypto': this.createBitcoinIcon(),
            'payment': this.createMoneyIcon(),
            'account': this.createAccountIcon(),
            'credit': this.createCreditIcon(),
            'loan': this.createLoanIcon(),
            'mortgage': this.createHouseMoneyIcon(),
            'salary': this.createSalaryIcon(),
            'tax': this.createTaxIcon(),
            'investment': this.createGraphIcon(),
            'workplace': this.createBriefcaseIcon(),
            'education': this.createGraduationIcon(),
            'hobby': this.createPaletteIcon(),
            'note': this.createNoteIcon(),
            'medical': this.createMedicalIcon(),
            'allergy': this.createAllergyIcon(),
            'blood_type': this.createBloodIcon(),
            'vehicle': this.createVehicleIcon(),
            'pet': this.createPetIcon(),
            'subscription': this.createSubscriptionIcon()
        };
        return iconMap[fieldId] || this.createNoteIcon();
    }

    createPersonIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#ccc"/><path d="M12 14c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="#ccc"/></svg>`; }
    createMaskIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/><path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ccc"/></svg>`; }
    createCalendarIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 6h14v2H5V6z" fill="#ccc"/></svg>`; }
    createNumberIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#ccc">123</text></svg>`; }
    createGenderIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#ccc" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="#ccc" stroke-width="2"/></svg>`; }
    createFlagIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" fill="#ccc"/></svg>`; }
    createSuitIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H3v-9H1v9c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="#ccc"/></svg>`; }
    createChurchIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 12.22V9l-5-2.5V5h2V3h-2V1h-2v2H9v2h2v1.5L6 9v3.22L2 14v8h8v-5h4v5h8v-8l-4-1.78zM20 20h-4v-2.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V20H4v-4.62l4-1.8v-3.35L12 8l4 2.03v3.35l4 1.8V20z" fill="#ccc"/></svg>`; }
    createRingIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/><circle cx="8.5" cy="9.5" r="1.5" fill="#ccc"/><circle cx="15.5" cy="9.5" r="1.5" fill="#ccc"/><path d="M12 17c-2.33 0-4.29-1.59-4.84-3.75h9.68C16.29 15.41 14.33 17 12 17z" fill="#ccc"/></svg>`; }
    createChildIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="#ccc"/><path d="M12 9c-2.21 0-4 1.79-4 4v7h2v-7c0-1.1.9-2 2-2s2 .9 2 2v7h2v-7c0-2.21-1.79-4-4-4z" fill="#ccc"/></svg>`; }
    createPassportIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="#ccc" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#ccc" stroke-width="1"/></svg>`; }
    createDocumentIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#ccc"/></svg>`; }
    createBuildingIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z" fill="#ccc"/></svg>`; }
    createCarIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#ccc"/></svg>`; }
    createGlobePassportIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 3h-3v2h3v2.65l-4 2.5V12h-2v-1.85L7 7.65V5h3V3H7c-1.1 0-2 .9-2 2v2.65c0 .53.21 1.04.59 1.42L9 13.15V15c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-1.85l3.41-2.08c.38-.38.59-.89.59-1.42V5c0-1.1-.9-2-2-2z" fill="#ccc"/></svg>`; }
    createHelmetIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="#ccc"/></svg>`; }
    createBabyIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="9" cy="9" r="2" fill="#ccc"/><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2s-2-.9-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z" fill="#ccc"/></svg>`; }
    createDiplomaIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM12 7h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zm4-8h-2v2h2V7zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="#ccc"/></svg>`; }
    createStampIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" fill="#ccc"/></svg>`; }
    createHealthIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="#ccc"/></svg>`; }
    createHomeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm6 16h-4v-6h-4v6H4v-9l8-4.5 8 4.5v9z" fill="#ccc"/></svg>`; }
    createOfficeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" fill="#ccc"/></svg>`; }
    createPinIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ccc"/></svg>`; }
    createHospitalIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="#ccc"/></svg>`; }
    createHistoryIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="#ccc"/></svg>`; }
    createBuilding2Icon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" fill="#ccc"/><path d="M11 7h2v4h-2zM7 11h4v2H7zM13 13h4v2h-4z" fill="#ccc"/></svg>`; }
    createTreeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h-4v2h10v-2h-4v-3h4V8h2v3h7zM12 9H7V6h5v3zm5 6v-3h5v3h-5z" fill="#ccc"/></svg>`; }
    createGarageIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 9V5h-3V2H7v3H4v4H2v11h20V9h-2zm-9-5h2v3h-2V4zm9 15H4v-9h16v9z" fill="#ccc"/><path d="M8 12h2v5H8zM14 12h2v5h-2z" fill="#ccc"/></svg>`; }
    createMailboxIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="#ccc"/></svg>`; }
    createBalanceIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 21h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1z" fill="#ccc"/></svg>`; }
    createPhoneIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#ccc"/></svg>`; }
    createEmailIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="#ccc"/></svg>`; }
    createPlaneIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#ccc"/></svg>`; }
    createGroupIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#ccc"/></svg>`; }
    createWhatsappIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" fill="#ccc"/></svg>`; }
    createSkypeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 6c-3.31 0-6 2.69-6 6 0 1.66.7 3.16 1.82 4.24l-1.82 1.82 3.54 3.54 1.82-1.82C14.84 17.3 16.34 18 18 18c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM6 8c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.66 0 3.16-.7 4.24-1.82l1.82 1.82 3.54-3.54-1.82-1.82C11.7 14.84 12 13.34 12 12c0-3.31-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#ccc"/></svg>`; }
    createInstagramIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25zM12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" fill="#ccc"/></svg>`; }
    createFacebookIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#ccc"/></svg>`; }
    createTwitterIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" fill="#ccc"/></svg>`; }
    createLinkedinIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="#ccc"/></svg>`; }
    createGlobeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#ccc"/></svg>`; }
    createLinkIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="#ccc"/></svg>`; }
    createComputerIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" fill="#ccc"/></svg>`; }
    createGearIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#ccc"/></svg>`; }
    createSearchIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#ccc"/></svg>`; }
    createRouterIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.2 5.9l-1.4-1.4c-.3-.3-.8-.3-1.1 0l-1.4 1.4c-.3.3-.3.8 0 1.1l1.4 1.4c.3.3.8.3 1.1 0l1.4-1.4c.3-.3.3-.8 0-1.1zM19 10h2V8h-2v2zm-7 12c-3.31 0-6-2.69-6-6 0-1.66.7-3.16 1.82-4.24l-1.82-1.82 3.54-3.54 1.82 1.82C12.84 6.7 14.34 6 16 6c3.31 0 6 2.69 6 6s-2.69 6-6 6zM8 13c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" fill="#ccc"/></svg>`; }
    createWifiIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="#ccc"/></svg>`; }
    createDomainIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/></svg>`; }
    createServerIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H4v-8h16v8zM8 13h8v2H8z" fill="#ccc"/></svg>`; }
    createShieldIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="#ccc"/></svg>`; }
    createCityIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm0-4H5V5h2v2zm4 12H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z" fill="#ccc"/></svg>`; }
    createMapIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill="#ccc"/></svg>`; }
    createTargetIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><circle cx="12" cy="12" r="5" fill="#ccc"/><circle cx="12" cy="12" r="2" fill="#333"/></svg>`; }
    createClockIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#ccc"/></svg>`; }
    createLatitudeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><path d="M12 6v12M6 12h12" stroke="#ccc" stroke-width="2"/></svg>`; }
    createLongitudeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#ccc"/><path d="M12 6v12M6 12h12" stroke="#ccc" stroke-width="2" transform="rotate(90 12 12)"/></svg>`; }
    createMountainIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" fill="#ccc"/></svg>`; }
    createSpeedIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 12 4c2.33 0 4.45.94 6 2.48l1.5-1.5C17.55 3.02 14.85 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.32-.27-2.57-.75-3.7L20.38 8.57z" fill="#ccc"/><path d="M12.5 7.5v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#ccc"/></svg>`; }
    createTarget2Icon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#ccc" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#ccc" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#ccc"/></svg>`; }
    createEyeIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#ccc"/></svg>`; }
    createCardIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="#ccc"/></svg>`; }
    createBitcoinIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17.06 11.57c.59-.69.94-1.59.94-2.57 0-1.86-1.27-3.43-3-3.87V3h-2v2h-2V3H9v2H6v2h2v10H6v2h3v2h2v-2h2v2h2v-2c2.21 0 4-1.79 4-4 0-1.45-.78-2.73-1.94-3.43zM10 7h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4V7zm5 10h-5v-4h5c1.1 0 2 .9 2 2s-.9 2-2 2z" fill="#ccc"/></svg>`; }
    createMoneyIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="#ccc"/></svg>`; }
    createAccountIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 4h16v2H4zm0 4h10v2H4z" fill="#ccc"/></svg>`; }
    createCreditIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="#ccc"/></svg>`; }
    createLoanIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#ccc"/></svg>`; }
    createHouseMoneyIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm6 16h-4v-6h-4v6H6v-9l6-4.5 6 4.5v9z" fill="#ccc"/><path d="M12.5 11.5h-1v2h1v1h-3v-1h1v-2h-1v-1h3v1z" fill="#ccc"/></svg>`; }
    createSalaryIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ccc"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#ccc"/></svg>`; }
    createTaxIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM8 9h8v2H8zm0 4h8v2H8z" fill="#ccc"/></svg>`; }
    createGraphIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 11V5h-3v2h-2V5H8v6h3V9h2v2h3zm-8 8H5v-3h3v3zm5 0h-3v-3h3v3zm5 0h-3v-3h3v3zM5 16h3v-3H5v3zm5-3v3h3v-3h-3zm5 0v3h3v-3h-3z" fill="#ccc"/></svg>`; }
    createBriefcaseIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#ccc"/></svg>`; }
    createGraduationIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="#ccc"/></svg>`; }
    createPaletteIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c2.76 0 5-2.24 5-5 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-4c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7z" fill="#ccc"/></svg>`; }
    createNoteIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#ccc"/></svg>`; }
    createMedicalIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 14h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="#ccc"/></svg>`; }
    createAllergyIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ccc"/></svg>`; }
    createBloodIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2c-3.27 0-6 2.73-6 6 0 4 6 10 6 10s6-6 6-10c0-3.27-2.73-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#ccc"/></svg>`; }
    createVehicleIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z" fill="#ccc"/></svg>`; }
    createPetIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="4.5" cy="9.5" r="2.5" fill="#ccc"/><circle cx="9" cy="5.5" r="2.5" fill="#ccc"/><circle cx="15" cy="5.5" r="2.5" fill="#ccc"/><circle cx="19.5" cy="9.5" r="2.5" fill="#ccc"/><path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z" fill="#ccc"/></svg>`; }
    createSubscriptionIcon() { return `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.53L16 16z" fill="#ccc"/></svg>`; }

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

            const containerRect = this.container.getBoundingClientRect();
            const x = clientX - containerRect.left - this.dragOffsetX;
            const y = clientY - containerRect.top - this.dragOffsetY;

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
            if ((e.ctrlKey || e.metaKey) && e.target === this.container) {
                e.preventDefault();

                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                const newScale = Math.max(minScale, Math.min(maxScale, this.dotContainerScale * delta));

                if (newScale !== this.dotContainerScale) {
                    const rect = this.container.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    const scaleChange = newScale / this.dotContainerScale;
                    const newLeft = this.containerLeft - (mouseX * (scaleChange - 1));
                    const newTop = this.containerTop - (mouseY * (scaleChange - 1));

                    this.dotContainerScale = newScale;
                    this.containerLeft = newLeft;
                    this.containerTop = newTop;

                    this.container.style.transform = `translate(${newLeft}px, ${newTop}px) scale(${this.dotContainerScale})`;
                    this.updateConnections();
                    this.updateScaleIndicator();
                }
            }
        }, { passive: false });
    }

    zoomIn() {
        const minScale = 0.3;
        const maxScale = 3;
        const newScale = Math.min(maxScale, this.dotContainerScale * 1.2);

        if (newScale !== this.dotContainerScale) {
            this.dotContainerScale = newScale;

            const rect = this.container.getBoundingClientRect();
            const centerX = window.innerWidth / 2 - rect.left;
            const centerY = window.innerHeight / 2 - rect.top;

            const scaleChange = newScale / this.dotContainerScale;
            const newLeft = this.containerLeft - (centerX * (scaleChange - 1));
            const newTop = this.containerTop - (centerY * (scaleChange - 1));

            this.containerLeft = newLeft;
            this.containerTop = newTop;

            this.container.style.transform = `translate(${newLeft}px, ${newTop}px) scale(${this.dotContainerScale})`;
            this.updateScaleIndicator();
            this.updateConnections();
        }
    }

    zoomOut() {
        const minScale = 0.3;
        const maxScale = 3;
        const newScale = Math.max(minScale, this.dotContainerScale * 0.8);

        if (newScale !== this.dotContainerScale) {
            this.dotContainerScale = newScale;

            const rect = this.container.getBoundingClientRect();
            const centerX = window.innerWidth / 2 - rect.left;
            const centerY = window.innerHeight / 2 - rect.top;

            const scaleChange = newScale / this.dotContainerScale;
            const newLeft = this.containerLeft - (centerX * (scaleChange - 1));
            const newTop = this.containerTop - (centerY * (scaleChange - 1));

            this.containerLeft = newLeft;
            this.containerTop = newTop;

            this.container.style.transform = `translate(${newLeft}px, ${newTop}px) scale(${this.dotContainerScale})`;
            this.updateScaleIndicator();
            this.updateConnections();
        }
    }

    setupScaleIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scale-indicator';
        indicator.textContent = `Масштаб: ${Math.round(this.dotContainerScale * 100)}%`;
        document.body.appendChild(indicator);
        this.scaleIndicator = indicator;
    }

    updateScaleIndicator() {
        if (this.scaleIndicator) {
            this.scaleIndicator.textContent = `Масштаб: ${Math.round(this.dotContainerScale * 100)}%`;
        }
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
                    { id: 'gender', label: 'Пол', icon: this.createGenderIcon() },
                    { id: 'nationality', label: 'Национальность', icon: this.createFlagIcon() },
                    { id: 'occupation', label: 'Профессия', icon: this.createSuitIcon() },
                    { id: 'religion', label: 'Религия', icon: this.createChurchIcon() },
                    { id: 'marital', label: 'Семейное положение', icon: this.createRingIcon() },
                    { id: 'children', label: 'Дети', icon: this.createChildIcon() }
                ]
            },
            {
                title: 'Документы',
                items: [
                    { id: 'passport', label: 'Паспорт РФ', icon: this.createPassportIcon() },
                    { id: 'snils', label: 'СНИЛС', icon: this.createDocumentIcon() },
                    { id: 'inn', label: 'ИНН', icon: this.createBuildingIcon() },
                    { id: 'driver', label: 'Водительские права', icon: this.createCarIcon() },
                    { id: 'foreign_passport', label: 'Загранпаспорт', icon: this.createGlobePassportIcon() },
                    { id: 'military_id', label: 'Военный билет', icon: this.createHelmetIcon() },
                    { id: 'birth_certificate', label: 'Свидетельство о рождении', icon: this.createBabyIcon() },
                    { id: 'diploma', label: 'Диплом об образовании', icon: this.createDiplomaIcon() },
                    { id: 'visa', label: 'Виза', icon: this.createStampIcon() },
                    { id: 'insurance', label: 'Медицинская страховка', icon: this.createHealthIcon() }
                ]
            },
            {
                title: 'Адреса',
                items: [
                    { id: 'home', label: 'Домашний адрес', icon: this.createHomeIcon() },
                    { id: 'work', label: 'Рабочий адрес', icon: this.createOfficeIcon() },
                    { id: 'reg', label: 'Адрес регистрации', icon: this.createPinIcon() },
                    { id: 'birth_place', label: 'Место рождения', icon: this.createHospitalIcon() },
                    { id: 'previous_address', label: 'Предыдущий адрес', icon: this.createHistoryIcon() },
                    { id: 'property', label: 'Недвижимость', icon: this.createBuilding2Icon() },
                    { id: 'land', label: 'Земельный участок', icon: this.createTreeIcon() },
                    { id: 'garage', label: 'Гараж', icon: this.createGarageIcon() },
                    { id: 'postal', label: 'Почтовый адрес', icon: this.createMailboxIcon() },
                    { id: 'legal_address', label: 'Юридический адрес', icon: this.createBalanceIcon() }
                ]
            },
            {
                title: 'Контакты',
                items: [
                    { id: 'phone', label: 'Телефон', icon: this.createPhoneIcon() },
                    { id: 'email', label: 'Email', icon: this.createEmailIcon() },
                    { id: 'telegram', label: 'Telegram', icon: this.createPlaneIcon() },
                    { id: 'vk', label: 'VKontakte', icon: this.createGroupIcon() },
                    { id: 'whatsapp', label: 'WhatsApp', icon: this.createWhatsappIcon() },
                    { id: 'skype', label: 'Skype', icon: this.createSkypeIcon() },
                    { id: 'instagram', label: 'Instagram', icon: this.createInstagramIcon() },
                    { id: 'facebook', label: 'Facebook', icon: this.createFacebookIcon() },
                    { id: 'twitter', label: 'Twitter', icon: this.createTwitterIcon() },
                    { id: 'linkedin', label: 'LinkedIn', icon: this.createLinkedinIcon() }
                ]
            },
            {
                title: 'Сеть и технологии',
                items: [
                    { id: 'ip', label: 'IP-адрес', icon: this.createGlobeIcon() },
                    { id: 'mac', label: 'MAC-адрес', icon: this.createLinkIcon() },
                    { id: 'device', label: 'Устройство', icon: this.createComputerIcon() },
                    { id: 'os', label: 'Операционная система', icon: this.createGearIcon() },
                    { id: 'browser', label: 'Браузер', icon: this.createSearchIcon() },
                    { id: 'router', label: 'Роутер', icon: this.createRouterIcon() },
                    { id: 'wifi', label: 'Wi-Fi сеть', icon: this.createWifiIcon() },
                    { id: 'domain', label: 'Домен', icon: this.createDomainIcon() },
                    { id: 'hosting', label: 'Хостинг', icon: this.createServerIcon() },
                    { id: 'vpn', label: 'VPN', icon: this.createShieldIcon() }
                ]
            },
            {
                title: 'Геолокация',
                items: [
                    { id: 'location', label: 'Город', icon: this.createCityIcon() },
                    { id: 'country', label: 'Страна', icon: this.createMapIcon() },
                    { id: 'coordinates', label: 'Координаты', icon: this.createTargetIcon() },
                    { id: 'timezone', label: 'Часовой пояс', icon: this.createClockIcon() },
                    { id: 'latitude', label: 'Широта', icon: this.createLatitudeIcon() },
                    { id: 'longitude', label: 'Долгота', icon: this.createLongitudeIcon() },
                    { id: 'altitude', label: 'Высота', icon: this.createMountainIcon() },
                    { id: 'speed', label: 'Скорость', icon: this.createSpeedIcon() },
                    { id: 'accuracy', label: 'Точность', icon: this.createTarget2Icon() },
                    { id: 'last_seen', label: 'Последнее местоположение', icon: this.createEyeIcon() }
                ]
            },
            {
                title: 'Финансы',
                items: [
                    { id: 'bank', label: 'Банковская карта', icon: this.createCardIcon() },
                    { id: 'crypto', label: 'Крипто-кошелек', icon: this.createBitcoinIcon() },
                    { id: 'payment', label: 'Платежные системы', icon: this.createMoneyIcon() },
                    { id: 'account', label: 'Банковский счет', icon: this.createAccountIcon() },
                    { id: 'credit', label: 'Кредитная история', icon: this.createCreditIcon() },
                    { id: 'loan', label: 'Кредит', icon: this.createLoanIcon() },
                    { id: 'mortgage', label: 'Ипотека', icon: this.createHouseMoneyIcon() },
                    { id: 'salary', label: 'Зарплата', icon: this.createSalaryIcon() },
                    { id: 'tax', label: 'Налоги', icon: this.createTaxIcon() },
                    { id: 'investment', label: 'Инвестиции', icon: this.createGraphIcon() }
                ]
            },
            {
                title: 'Дополнительно',
                items: [
                    { id: 'workplace', label: 'Место работы', icon: this.createBriefcaseIcon() },
                    { id: 'education', label: 'Образование', icon: this.createGraduationIcon() },
                    { id: 'hobby', label: 'Хобби/Интересы', icon: this.createPaletteIcon() },
                    { id: 'note', label: 'Заметки', icon: this.createNoteIcon() },
                    { id: 'medical', label: 'Медицинские данные', icon: this.createMedicalIcon() },
                    { id: 'allergy', label: 'Аллергии', icon: this.createAllergyIcon() },
                    { id: 'blood_type', label: 'Группа крови', icon: this.createBloodIcon() },
                    { id: 'vehicle', label: 'Транспортное средство', icon: this.createVehicleIcon() },
                    { id: 'pet', label: 'Домашние животные', icon: this.createPetIcon() },
                    { id: 'subscription', label: 'Подписки', icon: this.createSubscriptionIcon() }
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
