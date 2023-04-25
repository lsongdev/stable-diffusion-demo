import { ready } from 'https://lsong.org/scripts/dom.js';
import { h, render, useState, useEffect } from 'https://lsong.org/scripts/react/index.js';
import { serialize } from 'https://lsong.org/scripts/form.js';

import "https://lsong.org/js/application.js";

const getOptions = async () => {
  const response = await fetch(`/api/sdapi/v1/options`);
  return await response.json();
};

const getModels = async () => {
  const response = await fetch(`/api/sdapi/v1/sd-models`);
  return await response.json();
};

const setModel = async model => {
  const payload = {
    sd_model_checkpoint: model,
  };
  const response = await fetch(`/api/sdapi/v1/options`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

const text2image = async prompt => {
  const payload = {
    prompt,
    steps: 5,
  };
  const response = await fetch(`/api/sdapi/v1/txt2img`, {
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
    const { model, prompt } = serialize(e.target);
    await setModel(model);
    const { images } = await text2image(prompt);
    setImages(images);
  };
  return [
    h('form', { method: "post", onSubmit: handleSubmit }, [
      h('h2', null, "Stable Diffusion"),
      h('div', { className: 'form-field' }, [
        h('label', null, "Model"),
        h('select', { name: 'model', className: 'input' }, models.map(m => h('option', { value: m.title, selected: options.sd_model_checkpoint == m.title }, m.model_name))),
      ]),
      h('div', { className: 'form-field' }, [
        h('label', null, "Prompt"),
        h('textarea', { className: 'input', placeholder: 'Prompt', name: 'prompt', required: true }),
        // h('textarea', { className: 'input', placeholder: 'Negative prompt', name: 'negative_prompt' }),
      ]),
      h('div', { className: 'form-field' }, [
        h('button', { className: 'button button-primary button-block' }, 'Generate'),
      ]),
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