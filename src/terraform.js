"use strict";

import * as github from "./github.js";

function wellKnown(req, res) {
  res.json({
    "providers.v1": "/v1/providers/",
  });
}

// return versions of the provider
function listVersions(req, res) {
  let owner = req.params.namespace;
  let provider = req.params.type;
  let repository = "terraform-provider-" + provider;

  const platformRegex =
    /^(?<provider>[^_]+)_(?<version>[^_]+)_(?<os>\w+)_(?<arch>\w+)/;

  github.getReleases(owner, repository).then(
    function (releases) {
      let data = releases.data.map((release) => {
        return {
          version: release.tag_name,
          protocols: ["5.0"],
          platforms: release.assets
            .map(function (asset) {
              let name = asset.name;
              // check if is zip file
              if (name.endsWith(".zip")) {
                let match = name.match(platformRegex);
                if (match) {
                  return {
                    os: match.groups.os,
                    arch: match.groups.arch,
                  };
                }
              }
            })
            .filter((platform) => {
              return platform !== undefined;
            }),
        };
      });
      res.json(data);
    },
    function (err) {
      res.status(500).json(err);
    }
  );
}

function findPackage(req, res) {
  //   "terraform-provider-random_2.0.0_linux_amd64.zip"
  let repository = "terraform-provider-" + req.params.type;

  github.getRelease(req.params.namespace, repository, req.params.version).then(
    function (release) {
      let assetName = `${repository}_${req.params.version}_${req.params.os}_${req.params.arch}.zip`;

      res.json({
        protocols: ["5.0"],
        os: req.params.os,
        arch: req.params.arch,
        filename: assetName,
        download_url: github.getDownloadUrl(
          release,
          req.params.os,
          req.params.arch
        ),
        shasums_url: github.getShasumsUrl(release),
        shasums_signature_url: github.getShasumsSignatureUrl(release),
        signing_keys: {
          gpg_public_keys: [
            {
              key_id: process.env.GPG_KEY_ID,
              ascii_armor: process.env.GPG_KEY_ASCII_ARMOR,
            },
          ],
        },
      });
    },
    function (err) {
      res.status(500).json(err);
    }
  );
  return;
}

export function registry(router) {
  router.get("/.well-known/terraform.json", wellKnown);
  router.get("/v1/providers/:namespace/:type/versions", listVersions);
  router.get(
    "/v1/providers/:namespace/:type/:version/download/:os/:arch",
    findPackage
  );
}
