VERSION = $(shell git describe --tags)
IMAGE = ilvar/oh-client

image:
	@docker build -t $(IMAGE):$(VERSION) .

latest: image
	@docker tag $(IMAGE):$(VERSION) $(IMAGE):latest

push:
	@docker push $(IMAGE):$(VERSION)

push-latest: latest
	@docker push $(IMAGE):latest

clean:
	docker rmi $(IMAGE):$(VERSION)
	docker rmi $(IMAGE):latest
	rm -rf node_modules

.PHONY: image latest push push-latest clean
