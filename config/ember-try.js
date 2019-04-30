module.exports = {
  useYarn: true,
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
		{
			name: 'ember-1.12',
			bower: {
				dependencies: {
					ember: '~1.12.0',
					'ember-cli-shims': 'ember-cli/ember-cli-shims#0.0.3',
				},
				resolutions: {
					ember: '~1.12.0',
					'ember-cli-shims': '0.0.3',
				},
			},
			npm: {
				devDependencies: {
				},
			},
		},
		{
			name: 'ember-1.13',
			bower: {
				dependencies: {
					ember: '~1.13.0',
					'ember-cli-shims': '0.0.6',
				},
				resolutions: {
					ember: '~1.13.0',
					'ember-cli-shims': '0.0.6',
				},
			},
			npm: {
				devDependencies: {
				},
			},
		},
  ]
};
