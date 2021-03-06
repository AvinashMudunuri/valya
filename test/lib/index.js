import test from 'tape';
import React from 'react';
import { spy } from 'sinon';

import Valya from '../../lib/index';
import Validator from '../validator';
import { createRender, renderOnce } from '../render';
import '../setup';

const validators = [
    {
        validator: (value, params) => {
            if (value) {
                return Promise.resolve();
            }

            return Promise.reject(params.message);
        },
        params: {
            message: 'Field is required'
        }
    }
];

test('export', assert => {
    assert.true(
        typeof Valya === 'function',
        'must be a function'
    );

    assert.end();
});

test('init with default props', assert => {
    const validator = renderOnce(Validator, {
        validators,
        onEnd() {}
    });

    assert.false(
        validator.props.isValidating,
        'isValidating must be false'
    );

    assert.true(
        validator.props.isValid,
        'isValid must be true'
    );

    assert.equal(
        validator.props.validationMessage,
        null,
        'validationMessage must be null'
    );

    assert.end();
});

test('init with mixed props', assert => {
    const validator = renderOnce(Validator, {
        validators,
        onEnd() {},
        test: true
    });

    assert.true(
        validator.props.test,
        'mixed props must be merged'
    );

    assert.end();
});

test('init with children', assert => {
    const TestElement = React.createElement('div');
    const validator = renderOnce(Validator, { validators, onEnd() {} }, TestElement);

    assert.equal(
        validator.props.children,
        TestElement,
        'children must be passed through'
    );

    assert.end();
});

test('disabled + init', assert => {
    const onStartCallback = spy();
    const onEndCallback = spy();
    const props = {
        value: 'hello',
        shouldValidate: false,
        initialValidation: true,
        onStart: onStartCallback,
        onEnd: onEndCallback,
        validators
    };

    renderOnce(Validator, props);

    assert.true(
        onStartCallback.notCalled,
        'onStartCallback must not be called'
    );

    assert.true(
        onEndCallback.notCalled,
        'onEndCallback must not be called'
    );

    assert.end();
});

test('disabled + value change', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const onEndCallback = spy();
    const props = {
        value: 'hello',
        shouldValidate: false,
        onStart: onStartCallback,
        onEnd: onEndCallback,
        validators
    };

    render(Validator, props);

    props.value = '';

    render(Validator, props);

    assert.true(
        onStartCallback.notCalled,
        'onStartCallback must not be called'
    );

    assert.true(
        onEndCallback.notCalled,
        'onEndCallback must not be called'
    );

    assert.end();
});

test('initial validation + valid', assert => {
    const onStartCallback = spy();
    const props = {
        value: 'hello',
        initialValidation: true,
        onStart: onStartCallback,
        onEnd({ isValid, validationMessage }) {
            assert.true(
                isValid,
                'onEndCallback must be called with isValid = true'
            );

            assert.true(
                validationMessage === null,
                'onEndCallback must be called with validationMessage = null'
            );

            assert.end();
        },
        validators
    };

    renderOnce(Validator, props);

    assert.true(
        onStartCallback.calledOnce,
        'onStartCallback must be called once'
    );
});

test('initial validation + valid + change value while validating', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const onEndCallback = spy();
    const props = {
        value: 'hello',
        initialValidation: true,
        onStart: onStartCallback,
        onEnd: onEndCallback,
        validators
    };

    render(Validator, props);

    props.value = '';

    render(Validator, props);

    setTimeout(() => {
        assert.true(
            onStartCallback.calledTwice,
            'onStartCallback must be called twice'
        );

        assert.true(
            onEndCallback.calledOnce,
            'onEndCallback must be called once'
        );

        assert.true(
            onEndCallback.calledWithMatch({ isValid: false }),
            'onEndCallback must be called with isValid = false'
        );

        assert.true(
            onEndCallback.calledWithMatch({ validationMessage: validators[0].params.message }),
            'onEndCallback must be called with validationMessage = validators[0].params.message'
        );

        assert.end();
    }, 0);
});

test('initial validation + invalid + change value while validating', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const onEndCallback = spy();
    const props = {
        value: '',
        initialValidation: true,
        onStart: onStartCallback,
        onEnd: onEndCallback,
        validators
    };

    render(Validator, props);

    props.value = 'hello';

    render(Validator, props);

    setTimeout(() => {
        assert.true(
            onStartCallback.calledTwice,
            'onStartCallback must be called twice'
        );

        assert.true(
            onEndCallback.calledOnce,
            'onEndCallback must be called once'
        );

        assert.true(
            onEndCallback.calledWithMatch({ isValid: true }),
            'onEndCallback must be called with isValid = true'
        );

        assert.true(
            onEndCallback.calledWithMatch({ validationMessage: null }),
            'onEndCallback must be called with validationMessage = null'
        );

        assert.end();
    }, 0);
});

test('initial validation + valid + no start/end', assert => {
    const render = createRender();
    const props = {
        value: 'hello',
        initialValidation: true,
        onEnd() {},
        validators
    };

    render(Validator, props);

    setTimeout(() => {
        const validator = render(Validator, props);

        assert.true(
            validator.props.isValid,
            'isValid must be true'
        );

        assert.false(
            validator.props.isValidating,
            'isValidating must be false'
        );

        assert.equal(
            validator.props.validationMessage,
            null,
            'validationMessage must be null'
        );

        assert.end();
    }, 0);
});

test('initial validation + invalid', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const props = {
        value: '',
        initialValidation: true,
        onStart: onStartCallback,
        onEnd({ isValid, validationMessage }) {
            assert.false(
                isValid,
                'onEndCallback must be called with isValid = false'
            );

            assert.true(
                validationMessage === validators[0].params.message,
                'onEndCallback must be called with validationMessage'
            );

            assert.end();
        },
        validators
    };

    render(Validator, props);

    assert.true(
        onStartCallback.calledOnce,
        'onStartCallback must be called once'
    );
});

test('value change + valid', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const props = {
        value: '',
        onStart: onStartCallback,
        onEnd({ isValid, validationMessage }) {
            assert.true(
                isValid,
                'onEndCallback must be called with isValid = true'
            );

            assert.true(
                validationMessage === null,
                'onEndCallback must be called with validationMessage = null'
            );

            assert.end();
        },
        validators
    };

    render(Validator, props);

    props.value = 'hello';

    render(Validator, props);

    assert.true(
        onStartCallback.calledOnce,
        'onStartCallback must be called once'
    );
});

test('value change + invalid', assert => {
    const render = createRender();
    const onStartCallback = spy();
    const props = {
        value: 'hello',
        onStart: onStartCallback,
        onEnd({ isValid, validationMessage }) {
            assert.false(
                isValid,
                'onEndCallback must be called with isValid = false'
            );

            assert.true(
                validationMessage === validators[0].params.message,
                'onEndCallback must be called with validationMessage'
            );

            assert.end();
        },
        validators
    };

    render(Validator, props);

    props.value = '';

    render(Validator, props);

    assert.true(
        onStartCallback.calledOnce,
        'onStartCallback must be called once'
    );
});
