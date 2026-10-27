const IN_PROGRESS_LIMIT = 3;

const tasks = [
  {
    id: 1,
    title: 'Review DOM methods',
    tag: 'Web',
    priority: 1,
    status: 'todo',
    required: true
  },
  {
    id: 2,
    title: 'Practice JavaScript events',
    tag: 'Web',
    priority: 1,
    status: 'doing',
    required: true
  },
  {
    id: 3,
    title: 'Finish CSS layout',
    tag: 'Web',
    priority: 2,
    status: 'done',
    required: true
  },
  {
    id: 4,
    title: 'Solve graph exercises',
    tag: 'Math',
    priority: 1,
    status: 'doing',
    required: true
  },
  {
    id: 5,
    title: 'Review combinations',
    tag: 'Math',
    priority: 2,
    status: 'todo',
    required: false
  },
  {
    id: 6,
    title: 'Read about DHCP',
    tag: 'Networks',
    priority: 3,
    status: 'todo',
    required: false
  },
  {
    id: 7,
    title: 'Configure a router',
    tag: 'Networks',
    priority: 1,
    status: 'doing',
    required: true
  },
  {
    id: 8,
    title: 'Write network report',
    tag: 'Networks',
    priority: 2,
    status: 'todo',
    required: true
  },
  {
    id: 9,
    title: 'Practice array loops',
    tag: 'Web',
    priority: 2,
    status: 'done',
    required: false
  },
  {
    id: 10,
    title: 'Prepare for math quiz',
    tag: 'Math',
    priority: 3,
    status: 'todo',
    required: true
  }
];

const columns = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' }
];

const board = document.querySelector('#board');
const message = document.querySelector('#board-message');

let selectedTag = 'All';
let sortOrder = 'high';

function element(tag, text, className) {
  const item = document.createElement(tag);

  if (text !== undefined) {
    item.textContent = text;
  }

  if (className) {
    item.classList.add(className);
  }

  return item;
}

function makeControls() {
  const controls = document.querySelector('#controls');
  controls.classList.add('toolbar');

  const options = [
    {
      id: 'tag',
      label: 'Filter by subject',
      values: ['All', ...new Set(tasks.map(task => task.tag))]
    },
    {
      id: 'sort',
      label: 'Sort by priority',
      values: ['high', 'low']
    }
  ];

  for (const option of options) {
    const field = element('div', undefined, 'field');
    const label = element('label', option.label);
    label.htmlFor = option.id;

    const select = element('select');
    select.id = option.id;

    for (const value of option.values) {
      let text = value;

      if (value === 'high') {
        text = 'High first';
      } else if (value === 'low') {
        text = 'Low first';
      }

      const item = element('option', text);
      item.value = value;
      select.append(item);
    }

    field.append(label, select);
    controls.append(field);
  }
}

function render() {
  board.replaceChildren();

  let finished = 0;

  for (const task of tasks) {
    if (task.status === 'done') {
      finished++;
    }
  }

  const progress = element('progress');
  progress.max = tasks.length || 1;
  progress.value = finished;
  progress.setAttribute('aria-label', 'Finished tasks');

  const progressText = element(
    'p',
    `${finished} of ${tasks.length} tasks finished`
  );

  document.querySelector('#progress').replaceChildren(
    progressText,
    progress
  );

  const visible = tasks.filter(task =>
    selectedTag === 'All' || task.tag === selectedTag
  );

  visible.sort(function (a, b) {
    if (sortOrder === 'high') {
      return a.priority - b.priority;
    }

    return b.priority - a.priority;
  });

  for (const column of columns) {
    const section = element('section', undefined, 'column');
    const items = visible.filter(task => task.status === column.id);

    section.append(
      element('h2', `${column.title} (${items.length})`)
    );

    if (items.length === 0) {
      section.append(element('p', 'No tasks found.', 'empty'));
    }

    for (const task of items) {
      const card = element('article', undefined, 'card');

      card.append(element('h3', task.title));

      const details =
        `${task.tag} · Priority ${task.priority} · ` +
        `${task.required ? 'Required' : 'Optional'}`;

      card.append(element('p', details));

      const actions = element('div', undefined, 'actions');

      for (const target of columns) {
        if (target.id === task.status) {
          continue;
        }

        const button = element('button', target.title);
        button.type = 'button';
        button.dataset.id = task.id;
        button.dataset.status = target.id;

        actions.append(button);
      }

      card.append(actions);
      section.append(card);
    }

    board.append(section);
  }
}

board.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-id]');

  if (!button || !board.contains(button)) {
    return;
  }

  const task = tasks.find(task =>
    task.id === Number(button.dataset.id)
  );

  const target = button.dataset.status;

  if (!task || !columns.some(column => column.id === target)) {
    return;
  }

  let active = 0;

  for (const item of tasks) {
    if (item.status === 'doing') {
      active++;
    }
  }

  if (target === 'doing' && active >= IN_PROGRESS_LIMIT) {
    message.textContent =
      'In progress is full. Move one of its three tasks out first.';

    message.classList.add('error');
    return;
  }

  task.status = target;

  const destination = columns.find(column => column.id === target);

  message.textContent =
    `${task.title} moved to ${destination.title}.`;

  message.classList.remove('error');

  render();

  const movedCardButton = board.querySelector(
    `button[data-id="${task.id}"]`
  );

  if (movedCardButton) {
    movedCardButton.focus();
  }
});

makeControls();

document.querySelector('#tag').addEventListener('change', function (event) {
  selectedTag = event.target.value;
  message.textContent = '';
  render();
});

document.querySelector('#sort').addEventListener('change', function (event) {
  sortOrder = event.target.value;
  render();
});

render();