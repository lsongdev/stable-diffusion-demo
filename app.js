import { ready } from 'https://lsong.org/scripts/dom.js';
import { h, render, useState, useEffect } from 'https://lsong.org/scripts/react/index.js';
import { serialize } from 'https://lsong.org/scripts/form.js';

const api = `https://sd.cloudfun.dev`;

const getOptions = async () => {
  const response = await fetch(`${api}/sdapi/v1/options`);
  return await response.json();
};

const getModels = async () => {
  const response = await fetch(`${api}/sdapi/v1/sd-models`);
  return await response.json();
};

const setOptions = async options => {
  const response = await fetch(`${api}/sdapi/v1/options`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
  return response.json();
};

const setModel = model => {
  return setOptions({
    sd_model_checkpoint: model,
  });
};

const interrupt = e => {
  e.preventDefault();
  fetch(`${api}/sdapi/v1/interrupt`, {
    method: 'post',
  })
}

const skip = e => {
  e.preventDefault();
  fetch(`${api}/sdapi/v1/skip`, {
    method: 'post',
  });
}

const text2image = async (prompt, negative_prompt, options) => {
  const payload = {
    prompt,
    negative_prompt,
    steps: 5,
    batch_size: 3,
  };
  const response = await fetch(`${api}/sdapi/v1/txt2img`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  return response.json();
};

const App = () => {
  const [options, setOptions] = useState({});
  const [models, setModels] = useState([]);
  const [images, setImages] = useState([]);
  useEffect(() => {
    console.log('App is ready');
    getOptions().then(setOptions);
    getModels().then(setModels);
  }, []);
  const handleSubmit = async e => {
    e.preventDefault();
    const { model, prompt, negative_prompt } = serialize(e.target);
    await setModel(model);
    const { images } = await text2image(prompt, negative_prompt);
    setImages(images);
  };
  return [
    h('form', { method: "post", onSubmit: handleSubmit }, [
      h('h2', null, "Stable Diffusion"),
      h('div', { className: 'form-field' }, [
        h('label', null, "Checkpoint"),
        h('select', { name: 'model', className: 'input' }, models.map(m => h('option', { value: m.title, selected: options.sd_model_checkpoint == m.title }, m.model_name))),
      ]),
      h('div', { className: 'form-field' }, [
        h('label', null, "Prompt"),
        h('textarea', { className: 'input', placeholder: 'Prompt', name: 'prompt' }),
        h('textarea', { className: 'input', placeholder: 'Negative prompt', name: 'negative_prompt' }),
      ]),
      h('div', { className: 'form-field' }, [
        h('button', { className: 'button button-primary button-block', type: 'submit' }, 'Generate'),
        h('button', { className: 'button button-danger button-block', onClick: interrupt }, 'Interrupt'),
        h('button', { className: 'button button-warning button-block', onClick: skip }, 'Skip'),
      ]),
      h('div', { className: `form-field` }, [
      ])
    ]),
    h('div', { className: 'output' }, [
      h('h3', null, "Outputs"),
      images.map(data => h('img', { src: `data:image/png;base64,${data}` })),
    ])
  ]
}

ready(() => {
  const app = document.getElementById('app');
  render(h(App), app);
});