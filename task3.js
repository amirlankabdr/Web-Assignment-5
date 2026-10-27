const TOTAL_POINTS = 20;
const CLASS_MINIMUM = 7;

const takenNames = ['admin', 'knight', 'merlin'];
const skills = ['strength', 'magic', 'agility', 'vitality'];

const classSkills = {
  warrior: 'strength',
  mage: 'magic',
  rogue: 'agility'
};

const form = document.querySelector('#character-form');
const fields = [...form.querySelectorAll('input, select')];
const touched = new Set();
const summary = document.querySelector('#summary');

let submitted = false;

form.noValidate = true;

function readData() {
  const data = {
    name: form.elements.name.value.trim(),
    class: form.elements.class.value,
    color: form.elements.color.value,
    total: 0
  };

  for (const skill of skills) {
    data[skill] = Number(form.elements[skill].value);
    data.total += data[skill];
  }

  return data;
}

function getErrors() {
  const data = readData();
  const errors = {};

  for (const field of fields) {
    if (!field.checkValidity()) {
      if (skills.includes(field.id)) {
        errors[field.id] = 'Enter a whole number from 1 to 10.';
      } else if (field.id === 'name') {
        errors[field.id] = 'Enter a name with 3 to 16 characters.';
      } else {
        errors[field.id] = 'Choose a value.';
      }
    }
  }

  if (data.name.length < 3 || data.name.length > 16) {
    errors.name = 'Enter a name with 3 to 16 characters.';
  } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(data.name)) {
    errors.name = 'Use letters with one space between words.';
  } else if (takenNames.includes(data.name.toLowerCase())) {
    errors.name = 'This name is already taken. Choose another name.';
  }

  if (!Object.hasOwn(classSkills, data.class)) {
    errors.class = 'Choose a class.';
  }

  if (!['green', 'blue', 'purple', 'red'].includes(data.color)) {
    errors.color = 'Choose a card color.';
  }

  const requiredSkill = classSkills[data.class];

  if (
    requiredSkill &&
    data[requiredSkill] < CLASS_MINIMUM &&
    !errors[requiredSkill]
  ) {
    errors[requiredSkill] =
      `${data.class} needs at least ${CLASS_MINIMUM} ${requiredSkill} points.`;
  }

  if (data.total !== TOTAL_POINTS && !errors.vitality) {
    errors.vitality =
      `Use exactly ${TOTAL_POINTS} skill points. Current total: ${data.total}.`;
  }

  return errors;
}

function showErrors() {
  const errors = getErrors();

  for (const field of fields) {
    const show = touched.has(field.id) && Boolean(errors[field.id]);

    document.querySelector(`#${field.id}-error`).textContent =
      show ? errors[field.id] : '';

    field.setAttribute('aria-invalid', String(show));
  }

  if (submitted) {
    const count = Object.keys(errors).length;

    summary.textContent = count
      ? `${count} fields need attention. Please correct them below.`
      : '';
  }

  return errors;
}

function makeCard(data, final) {
  const card = document.createElement('section');
  card.classList.add('panel', 'character', `color-${data.color}`);

  const title = document.createElement('h3');
  title.textContent = data.name || 'Your character';

  const type = document.createElement('p');
  type.textContent = `Class: ${data.class || 'not selected'}`;

  card.append(title, type);

  for (const skill of skills) {
    const line = document.createElement('p');
    const skillName = skill[0].toUpperCase() + skill.slice(1);

    line.textContent = `${skillName}: ${data[skill]}`;
    card.append(line);
  }

  if (final) {
    const status = document.createElement('p');
    status.textContent = 'Character created successfully!';
    status.classList.add('success');
    card.append(status);
  }

  return card;
}

function updatePreview() {
  const data = readData();

  document.querySelector('#preview').replaceChildren(
    makeCard(data, false)
  );

  const points = document.querySelector('#points');

  points.textContent =
    `Points left: ${TOTAL_POINTS - data.total} / ${TOTAL_POINTS}`;

  points.classList.toggle('error', data.total > TOTAL_POINTS);
}

for (const field of fields) {
  field.addEventListener('blur', function () {
    touched.add(field.id);
    showErrors();
  });
}

form.addEventListener('input', function () {
  updatePreview();
  showErrors();
});

form.addEventListener('change', function () {
  updatePreview();
  showErrors();
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  submitted = true;

  for (const field of fields) {
    touched.add(field.id);
  }

  const errors = showErrors();
  const firstInvalid = fields.find(field => errors[field.id]);

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const data = readData();

  document.querySelector('#result').replaceChildren(
    makeCard(data, true)
  );

  takenNames.push(data.name.toLowerCase());

  form.reset();
});

form.addEventListener('reset', function () {
  touched.clear();
  submitted = false;
  summary.textContent = '';

  for (const field of fields) {
    field.removeAttribute('aria-invalid');
    document.querySelector(`#${field.id}-error`).textContent = '';
  }

  setTimeout(updatePreview, 0);
});

updatePreview();